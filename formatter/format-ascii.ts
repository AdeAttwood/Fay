import type { Format, FormatItem } from "./mod.ts";
import { colors } from "@cliffy/ansi/colors";

const userHighlight = colors.yellow.bold;
const assistantHighlight = colors.green.bold;
const toolHighlight = colors.magenta.bold;
const diffAdded = colors.green;
const diffRemoved = colors.red;

export const consoleFormat: Format = {
  formatUserMessage(item: Extract<FormatItem, { type: "user-message" }>) {
    console.log(userHighlight("┃ USER:"));
    console.log(userHighlight("┃"));
    for (const line of item.content.split("\n")) {
      console.log(userHighlight("┃"), line);
    }
    console.log(userHighlight("┃"));
  },

  formatAssistantMessage(
    item: Extract<FormatItem, { type: "assistant-message" }>,
  ) {
    console.log(assistantHighlight("┃ ASSISTANT:"));
    console.log(assistantHighlight("┃"));
    for (const line of item.content.split("\n")) {
      console.log(assistantHighlight("┃"), line);
    }
    console.log(assistantHighlight("┃"));
  },

  formatEdit(item: Extract<FormatItem, { type: "edit" }>) {
    console.log(toolHighlight("┃ EDIT:"), item.fileName);
    console.log(toolHighlight("┃"));
    item.content.forEach((line) => {
      if (line.type === "added") {
        console.log(toolHighlight("┃"), diffAdded("+ " + line.content));
      } else if (line.type === "removed") {
        console.log(toolHighlight("┃"), diffRemoved("- " + line.content));
      } else {
        console.log(toolHighlight("┃"), "  " + line.content);
      }
    });
    console.log(toolHighlight("┃"));
  },

  formatRead(item: Extract<FormatItem, { type: "read" }>) {
    console.log(toolHighlight(`┃ READ:`), item.fileName);
    console.log(toolHighlight("┃"));
    for (const line of formatContent(item.content)) {
      console.log(toolHighlight("┃"), line);
    }
    console.log(toolHighlight("┃"));
  },

  formatWrite(item: Extract<FormatItem, { type: "write" }>) {
    console.log(toolHighlight(`┃ WRITE:`), item.fileName);
    console.log(toolHighlight("┃"));
    for (const line of formatContent(item.content)) {
      console.log(toolHighlight("┃"), line);
    }
    console.log(toolHighlight("┃"));
  },

  formatRun(item: Extract<FormatItem, { type: "run" }>) {
    console.log(toolHighlight("┃"));
    console.log(toolHighlight("┃ RUN:"), item.programme, item.args.join(" "));
    console.log(toolHighlight("┃"));
    for (const line of item.result.split("\n")) {
      console.log(toolHighlight("┃"), line);
    }
    console.log(toolHighlight("┃"));
  },

  formatGlob(item: Extract<FormatItem, { type: "glob" }>) {
    console.log(toolHighlight("┃ GLOB:"), item.pattern);
    console.log(toolHighlight("┃"));
    for (const line of item.content.split("\n")) {
      console.log(toolHighlight("┃"), line);
    }
    console.log(toolHighlight("┃"));
  },

  formatReviewComments(item: Extract<FormatItem, { type: "review-comments" }>) {
    console.log(toolHighlight(`┃ REVIEW-COMMENTS:`));
    console.log(toolHighlight("┃"));
    for (const line of item.content.split("\n")) {
      console.log(toolHighlight("┃"), line);
    }
    console.log(toolHighlight("┃"));
  },

  formatToolResult(item: Extract<FormatItem, { type: "tool-result" }>) {
    console.log(toolHighlight(`┃ TOOL-RESULT:`));
    console.log(toolHighlight("┃"));
    for (const line of item.content.split("\n")) {
      console.log(toolHighlight("┃"), line);
    }
    console.log(toolHighlight("┃"));
  },
};

function formatContent(content: string) {
  const split = content.split("\n");
  if (split.length < 4) {
    return split;
  }

  return [...split.slice(0, 4), "....."];
}
