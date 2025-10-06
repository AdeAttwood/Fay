import type { Format } from "@fay/formatter";
import type { Context } from "./mod.ts";

function formatLongContent(content: string) {
  const split = content.split("\n");
  if (split.length < 4) {
    return content;
  }

  return [...split.slice(0, 4), "....."].join("\n");
}

export function createFormatter(
  sessionId: string,
  client: Context["client"],
): Format {
  return {
    formatUserMessage() {
      // NOOP
    },

    formatAssistantMessage(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "agent_message_chunk",
          content: {
            type: "text",
            text: message.content,
          },
        },
      });
    },

    formatEdit(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "tool_call",
          title: `EDIT: ${message.fileName}`,
          toolCallId: message.toolCallId,
          locations: [
            {
              path: message.fileName,
            },
          ],
          content: [
            {
              type: "diff",
              path: message.fileName,
              oldText: message.oldContent,
              newText: message.newContent,
            },
          ],
        },
      });
    },

    formatGlob(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "tool_call",
          title: `GLOB: ${message.pattern}`,
          toolCallId: message.toolCallId,
          content: [
            {
              type: "content",
              content: {
                type: "text",
                text: message.content,
              },
            },
          ],
        },
      });
    },

    formatRead(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "tool_call",
          title: `READ: ${message.fileName}`,
          toolCallId: message.toolCallId,
          locations: [
            {
              path: message.fileName,
            },
          ],
          content: [
            {
              type: "content",
              content: {
                type: "text",
                text: formatLongContent(message.content),
              },
            },
          ],
        },
      });
    },

    formatReviewComments(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "tool_call",
          title: `COMMENTS: PR`,
          toolCallId: message.toolCallId,
          content: [
            {
              type: "content",
              content: {
                type: "text",
                text: formatLongContent(message.content),
              },
            },
          ],
        },
      });
    },

    formatRun(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "tool_call",
          title: `RUN: ${message.programme} ${message.args.join(" ")}`,
          toolCallId: message.toolCallId,
          content: [
            {
              type: "content",
              content: {
                type: "text",
                text: message.result,
              },
            },
          ],
        },
      });
    },

    formatWrite(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "tool_call",
          title: `WRITE: ${message.fileName}`,
          toolCallId: message.toolCallId,
          locations: [
            {
              path: message.fileName,
            },
          ],
          content: [
            {
              type: "content",
              content: {
                type: "text",
                text: formatLongContent(message.content),
              },
            },
          ],
        },
      });
    },

    formatToolResult(message) {
      client.notify("session/update", {
        sessionId,
        update: {
          sessionUpdate: "tool_call",
          title: `TOOL CALL`,
          toolCallId: message.toolCallId,
          content: [
            {
              type: "content",
              content: {
                type: "text",
                text: message.content,
              },
            },
          ],
        },
      });
    },
  };
}
