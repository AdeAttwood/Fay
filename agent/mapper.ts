import type { ModelMessage } from "ai";
import type {
  InternalMessage,
  InternalTextPart,
  InternalToolCallPart,
} from "./types.ts";

export function toInternalmessage(message: ModelMessage): InternalMessage {
  switch (message.role) {
    case "system":
      return {
        role: "system",
        content: message.content,
      };
    case "user":
      if (typeof message.content === "string") {
        return {
          role: "user",
          content: message.content,
        };
      } else {
        return {
          role: "user",
          content: message.content.map((part) =>
            "text" in part ? part.text : ""
          ),
        };
      }
    case "assistant":
      if (typeof message.content === "string") {
        return {
          role: "assistant",
          content: message.content,
        };
      } else {
        const parts = message.content
          .map((part) => {
            if (part.type === "text") {
              return { type: "text" as const, text: part.text };
            } else if (part.type === "tool-call") {
              return {
                type: "tool-call" as const,
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                args: part.input,
              };
            }
          })
          .filter((part): part is InternalTextPart | InternalToolCallPart =>
            part !== undefined
          );
        return {
          role: "assistant",
          content: parts,
        };
      }
    case "tool":
      return {
        role: "tool",
        content: message.content.map((part) => ({
          type: "tool-result",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          result: part.output.type === "text"
            ? part.output.value
            : JSON.stringify(part.output.value),
        })),
      };
  }
}

export function toModelMessage(message: InternalMessage): ModelMessage {
  switch (message.role) {
    case "system":
      return {
        role: "system",
        content: message.content,
      } as ModelMessage;
    case "user":
      if (typeof message.content === "string") {
        return {
          role: "user",
          content: message.content,
        } as ModelMessage;
      } else {
        return {
          role: "user",
          content: message.content.map((text) => ({ type: "text", text })),
        } as ModelMessage;
      }
    case "assistant":
      if (typeof message.content === "string") {
        return {
          role: "assistant",
          content: message.content,
        } as ModelMessage;
      } else {
        return {
          role: "assistant",
          content: message.content
            .map((part) => {
              if (part.type === "text") {
                return { type: "text", text: part.text };
              } else if (part.type === "tool-call") {
                return {
                  type: "tool-call",
                  toolCallId: part.toolCallId,
                  toolName: part.toolName,
                  input: part.args,
                };
              }
            })
            .filter((part) => part !== undefined),
        } as ModelMessage;
      }
    case "tool":
      return {
        role: "tool",
        content: message.content.map((part) => ({
          type: "tool-result",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          output: { type: "text", value: part.result },
        })),
      } as ModelMessage;
  }
}
