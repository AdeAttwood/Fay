import { Agent, SessionManager } from "@fay/agent";
import type { Context } from "./mod.ts";
import * as Schema from "./schema.ts";
import path from "node:path";
import { Configuration } from "../agent/config.ts";

function buildMessageText(
  context: Context,
  blocks: Schema.ContentBlock[],
): string {
  const message: string[] = [];

  for (const block of blocks) {
    if (block.type == "text") {
      message.push(block.text);
      continue;
    }

    if (block.type == "resource_link") {
      const url = new URL(block.uri);

      if (url.protocol == "zed" && url.pathname == "/agent/file") {
        const path = url.searchParams.get("path");
        if (path) message.push(path);

        continue;
      }

      context.log(`Skipping unknown resource link ${JSON.stringify(block)}`);
      continue;
    }

    throw new Error(`Unsupported content block type ${block.type}`);
  }

  return message.join(" ");
}

export const Handlers = {
  [Schema.AGENT_METHODS.initialize]: function (
    request: Schema.InitializeRequest,
    context: Context,
  ): Schema.InitializeResponse {
    context.state.clientCapabilities = request.clientCapabilities;

    return {
      protocolVersion: Schema.PROTOCOL_VERSION,
      agentCapabilities: {
        loadSession: true,
        promptCapabilities: {
          audio: false,
          embeddedContext: false,
          image: false,
        },
      },
    };
  },

  [Schema.AGENT_METHODS.session_load]: async function (
    request: Schema.LoadSessionRequest,
    context: Context,
  ): Promise<Schema.LoadSessionResponse> {
    const sessionDir = path.join(request.cwd, ".git", "fay", "sessions");
    const sessionManager = new SessionManager(sessionDir);

    const sessions = await sessionManager.list();
    const session = sessions.find((s) => s.id == request.sessionId);
    if (!session) {
      throw new Error(
        "Unable to find session, this should have already been created",
      );
    }

    const config = Configuration.find(request.cwd);
    context.state.agents.set(session.id, new Agent(config, session));

    return {};
  },

  [Schema.AGENT_METHODS.session_new]: function (
    request: Schema.NewSessionRequest,
    context: Context,
  ): Schema.NewSessionResponse {
    const fayDir = path.join(request.cwd, ".git", "fay");

    const agent = Agent.new({
      title: `Agent session ${new Date().toUTCString()}`,
    });

    agent.session.save(
      path.join(fayDir, "sessions", `${agent.session.id}.json`),
    );

    context.state.agents.set(agent.session.id, agent);

    return {
      sessionId: agent.session.id,
    };
  },

  [Schema.AGENT_METHODS.session_prompt]: async function (
    request: Schema.PromptRequest,
    context: Context,
  ): Promise<Schema.PromptResponse> {
    const agent = context.state.agents.get(request.sessionId);
    if (!agent) {
      throw new Error(
        "Session is not loaded, ensure you have called `session/new` or `session/load`",
      );
    }

    for await (
      const message of agent.prompt(
        buildMessageText(context, request.prompt),
      )
    ) {
      switch (message.role) {
        case "user":
          context.client.notify("session/update", {
            sessionId: agent.session.id,
            update: {
              sessionUpdate: "user_message_chunk",
              content: {
                type: "text",
                text: Array.isArray(message.content)
                  ? message.content.join("\n")
                  : message.content,
              },
            },
          });

          break;
        case "assistant":
          context.client.notify("session/update", {
            sessionId: agent.session.id,
            update: {
              sessionUpdate: "agent_message_chunk",
              content: {
                type: "text",
                text: Array.isArray(message.content)
                  ? message.content.join("\n")
                  : message.content,
              },
            },
          });

          break;
        case "tool":
          for (const call of message.content) {
            context.client.notify("session/update", {
              sessionId: agent.session.id,
              update: {
                sessionUpdate: "tool_call",
                title: `${call.toolName}`,
                toolCallId: call.toolCallId,
              },
            });
          }

          break;
        case "system":
          // Do noting
          break;
      }
    }

    return {
      stopReason: "end_turn",
    };
  },
};

// const a = {
//   jsonrpc: "2.0",
//   id: 3,
//   method: "session/prompt",
//   params: {
//     sessionId: "96ea491c-bf59-4331-b76e-17199962b720",
//     prompt: [
//       { type: "text", text: "This is a message " },
//       {
//         type: "resource_link",
//         name: "ThriftBasicServiceTest.cs",
//         uri: "zed:///agent/file?path=D%3A%5CCode%5Csrc%5Cgithub.com%5CAdeAttwood%5CRpcNet%5Ctest%5CNetRpc.Core.Test%5CThrift%5CThriftBasicServiceTest.cs",
//       },
//     ],
//   },
// };
