import type { Format, FormatItem } from "./index.ts";

function details(
  summary: string,
  content: string,
  contentType: string = "txt",
) {
  console.log("");
  console.log("<details>");
  console.log(`<summary>${summary}</summary>`);
  console.log("");
  console.log("```" + contentType);
  console.log(content);
  console.log("```");
  console.log("");
  console.log("</details>");
  console.log("");
}

export const markdownFormat: Format = {
  formatUserMessage(item: Extract<FormatItem, { type: "user-message" }>) {
    console.log("## USER:");
    console.log("");
    console.log(item.content);
    console.log("");
  },

  formatAssistantMessage(
    item: Extract<FormatItem, { type: "assistant-message" }>,
  ) {
    console.log("## ASSISTANT:");
    console.log("");
    console.log(item.content);
    console.log("");
  },

  formatEdit(item: Extract<FormatItem, { type: "edit" }>) {
    details(
      "EDIT: " + item.fileName,
      item.content.map((line) => {
        if (line.type === "added") {
          return "+ " + line.content;
        } else if (line.type === "removed") {
          return "- " + line.content;
        } else {
          return "  " + line.content;
        }
      }).join("\n"),
      "diff",
    );
  },

  formatRead(item: Extract<FormatItem, { type: "read" }>) {
    details(
      `READ: ${item.fileName}`,
      item.content,
      item.fileName.split(".").pop() || "txt",
    );
  },

  formatWrite(item: Extract<FormatItem, { type: "write" }>) {
    details(
      `WRITE: ${item.fileName}`,
      item.content,
      item.fileName.split(".").pop() || "txt",
    );
  },

  formatRun(item: Extract<FormatItem, { type: "run" }>) {
    details(
      "RUN: `" + item.programme + " " + item.args.join(" ") + "`",
      item.result,
    );
  },

  formatGlob(item: Extract<FormatItem, { type: "glob" }>) {
    details("GLOB: `" + item.pattern + "`", item.content);
  },

  formatReviewComments(item: Extract<FormatItem, { type: "review-comments" }>) {
    console.log("## REVIEW COMMENTS:");
    console.log("");
    console.log(item.content);
    console.log("");
  },

  formatToolResult(item: Extract<FormatItem, { type: "tool-result" }>) {
    console.log(`## TOOL RESULT:`);
    details("Tool Result", item.content);
  },
};
