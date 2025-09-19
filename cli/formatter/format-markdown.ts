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
  write(item: FormatItem) {
    switch (item.type) {
      case "user-message":
        console.log("## USER:");
        console.log("");
        console.log(item.content);
        console.log("");
        return;
      case "assistant-message":
        console.log("## ASSISTANT:");
        console.log("");
        console.log(item.content);
        console.log("");
        return;
      case "edit":
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
        return;
      case "read":
      case "write":
        details(
          `${item.type.toUpperCase()}: ${item.fileName}`,
          item.content,
          item.fileName.split(".").pop() || "txt",
        );
        return;
      case "glob":
        details("GLOB: `" + item.pattern + "`", item.content);
        return;
      case "run":
        details(
          "RUN: `" + item.programme + " " + item.args.join(" ") + "`",
          item.result,
        );
        return;
      case "review-comments":
        console.log("## REVIEW COMMENTS:");
        console.log("");
        console.log(item.content);
        console.log("");
        return;
      case "tool-result":
        console.log(`## TOOL RESULT:`);
        details("Tool Result", item.content);
        return;
    }
  },
};
