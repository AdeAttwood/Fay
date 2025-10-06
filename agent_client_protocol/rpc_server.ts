import { Agent, SessionManager } from "@fay/agent";
import type { Context } from "./mod.ts";
import * as Schema from "./schema.ts";
import path from "node:path";
import { Configuration } from "../agent/config.ts";
import { createFormatter } from "./formatter.ts";
import { formatMessage } from "@fay/formatter";
import { buildMessageText } from "./build_message.ts";

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

    const formatter = createFormatter(agent.session.id, context.client);

    for await (
      const message of agent.prompt(
        buildMessageText(context, request.prompt),
      )
    ) {
      formatMessage(message, agent.session.messages, formatter);
    }

    return {
      stopReason: "end_turn",
    };
  },
};
