import {
  InternalAssistantMessage,
  InternalMessage,
  InternalToolMessage,
  InternalUserContent,
} from "@fay/agent";
import z from "zod";

export type FormatItem =
  | { type: "user-message"; content: string }
  | { type: "assistant-message"; content: string }
  | { type: "edit"; content: DiffItem[]; fileName: string }
  | { type: "read"; content: string; fileName: string }
  | { type: "write"; content: string; fileName: string }
  | { type: "run"; programme: string; args: string[]; result: string }
  | { type: "glob"; content: string; pattern: string }
  | { type: "review-comments"; content: string }
  | { type: "tool-result"; content: string };

export type DiffItem = {
  type: "added" | "removed" | "context";
  content: string;
};

export interface Format {
  formatUserMessage: (
    item: Extract<FormatItem, { type: "user-message" }>,
  ) => void;

  formatAssistantMessage: (
    item: Extract<FormatItem, { type: "assistant-message" }>,
  ) => void;

  formatEdit: (item: Extract<FormatItem, { type: "edit" }>) => void;

  formatRead: (item: Extract<FormatItem, { type: "read" }>) => void;

  formatWrite: (item: Extract<FormatItem, { type: "write" }>) => void;

  formatRun: (item: Extract<FormatItem, { type: "run" }>) => void;

  formatGlob: (item: Extract<FormatItem, { type: "glob" }>) => void;

  formatReviewComments: (
    item: Extract<FormatItem, { type: "review-comments" }>,
  ) => void;

  formatToolResult: (
    item: Extract<FormatItem, { type: "tool-result" }>,
  ) => void;
}

const toolCallSchema = z.union([
  z.object({
    toolName: z.literal("edit"),
    args: z.object({
      fileName: z.string(),
      oldContent: z.string(),
      newContent: z.string(),
    }),
  }),
  z.object({
    toolName: z.literal("read"),
    args: z.object({
      fileName: z.string(),
    }),
  }),
  z.object({
    toolName: z.literal("write"),
    args: z.object({
      fileName: z.string(),
      content: z.string(),
    }),
  }),
  z.object({
    toolName: z.literal("glob"),
    args: z.object({
      pattern: z.string(),
    }),
  }),
  z.object({
    toolName: z.literal("run"),
    args: z.object({
      programme: z.string(),
      args: z.union([z.array(z.string()), z.string()]),
      cwd: z.string().optional(),
    }),
  }),
  z.object({
    toolName: z.literal("ghPullReviewReviews"),
    args: z.object({}),
  }),
]);

function formatDiff(oldText: string, newText: string): DiffItem[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const output: DiffItem[] = [];

  const lcsMatrix: number[][] = Array(oldLines.length + 1)
    .fill(null)
    .map(() => Array(newLines.length + 1).fill(0));

  for (let i = 1; i <= oldLines.length; i++) {
    for (let j = 1; j <= newLines.length; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        lcsMatrix[i][j] = lcsMatrix[i - 1][j - 1] + 1;
      } else {
        lcsMatrix[i][j] = Math.max(lcsMatrix[i - 1][j], lcsMatrix[i][j - 1]);
      }
    }
  }

  const lcs: string[] = [];
  let i = oldLines.length;
  let j = newLines.length;
  while (i > 0 && j > 0) {
    if (oldLines[i - 1] === newLines[j - 1]) {
      lcs.unshift(oldLines[i - 1]);
      i--;
      j--;
    } else if (lcsMatrix[i - 1][j] >= lcsMatrix[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  let oldIndex = 0;
  let newIndex = 0;

  for (const line of lcs) {
    while (oldIndex < oldLines.length && oldLines[oldIndex] !== line) {
      output.push({ type: "removed", content: oldLines[oldIndex] });
      oldIndex++;
    }
    while (newIndex < newLines.length && newLines[newIndex] !== line) {
      output.push({ type: "added", content: newLines[newIndex] });
      newIndex++;
    }

    output.push({ type: "context", content: line });
    oldIndex++;
    newIndex++;
  }

  while (oldIndex < oldLines.length) {
    output.push({ type: "removed", content: oldLines[oldIndex] });
    oldIndex++;
  }

  while (newIndex < newLines.length) {
    output.push({ type: "added", content: newLines[newIndex] });
    newIndex++;
  }

  return output;
}

function printAssistantMessage(
  message: InternalAssistantMessage,
  format: Format,
) {
  if (typeof message.content === "string") {
    return format.formatAssistantMessage({
      type: "assistant-message",
      content: message.content,
    });
  }

  message.content.forEach((c) => {
    if (c.type === "text") {
      return format.formatAssistantMessage({
        type: "assistant-message",
        content: c.text,
      });
    }
  });
}

function getToolCall(id: string, messages: InternalMessage[]) {
  for (const message of messages) {
    if (message.role === "assistant") {
      for (const content of message.content) {
        if (
          typeof content !== "string" &&
          content.type === "tool-call" &&
          content.toolCallId == id
        ) {
          return content;
        }
      }
    }
  }
}

function printToolMessage(
  message: InternalToolMessage,
  messages: InternalMessage[],
  format: Format,
) {
  message.content.forEach((c) => {
    const toolCallResult = toolCallSchema.safeParse(
      getToolCall(c.toolCallId, messages),
    );
    if (!toolCallResult.success) {
      console.log(toolCallResult.error);
      console.log(c);

      throw new Error("Error parsing tool response");
    }

    const toolCall = toolCallResult.data;

    const stringResult = typeof c.result === "string"
      ? c.result
      : JSON.stringify(c.result || "", undefined, 2);

    if (toolCall.toolName === "edit") {
      return format.formatEdit({
        type: "edit",
        fileName: toolCall.args.fileName,
        content: formatDiff(toolCall.args.oldContent, toolCall.args.newContent),
      });
    }

    if (toolCall.toolName === "read") {
      return format.formatRead({
        type: "read",
        fileName: toolCall.args.fileName,
        content: stringResult,
      });
    }

    if (toolCall.toolName === "write") {
      return format.formatWrite({
        type: "write",
        fileName: toolCall.args.fileName,
        content: toolCall.args.content,
      });
    }

    if (toolCall.toolName === "glob") {
      return format.formatGlob({
        type: "glob",
        pattern: toolCall.args.pattern,
        content: stringResult,
      });
    }

    if (toolCall.toolName === "run") {
      let args = toolCall.args.args;
      if (typeof args === "string") {
        try {
          args = JSON.parse(args) as string[];
        } catch (_) {
          args = [args as string];
        }
      }

      return format.formatRun({
        type: "run",
        programme: toolCall.args.programme,
        args,
        result: stringResult,
      });
    }

    if (toolCall.toolName === "ghPullReviewReviews") {
      return format.formatReviewComments({
        type: "review-comments",
        content: stringResult,
      });
    }

    if (stringResult.trim().length === 0) {
      return;
    }

    format.formatToolResult({
      type: "tool-result",
      content: stringResult,
    });
  });
}

function formatUserMessageContent(message: InternalUserContent) {
  if (typeof message === "string") {
    return message;
  }

  return "(UNSUPPORTED USER MESSAGE CONTENT)";
}

export function formatMessage(
  message: InternalMessage,
  messages: InternalMessage[],
  format: Format,
) {
  switch (message.role) {
    case "user":
      return format.formatUserMessage({
        type: "user-message",
        content: formatUserMessageContent(message.content),
      });
    case "assistant":
      return printAssistantMessage(message, format);
    case "tool":
      return printToolMessage(message, messages, format);
  }
}

export { consoleFormat } from "./format-ascii.ts";
export { markdownFormat } from "./format-markdown.ts";
