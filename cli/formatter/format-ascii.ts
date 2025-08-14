import { Format, FormatItem } from "./index.ts";
import { colors } from "@cliffy/ansi/colors";

const userHighlight = colors.yellow.bold;
const assistantHighlight = colors.green.bold;
const toolHighlight = colors.magenta.bold;
const diffAdded = colors.green;
const diffRemoved = colors.red;

export const consoleFormat: Format = {
  write(item: FormatItem) {
    switch (item.type) {
      case "user-message":
        console.log(userHighlight("┃ USER:"));
        console.log(userHighlight("┃"));
        for (const line of item.content.split("\n")) {
          console.log(userHighlight("┃"), line);
        }
        console.log(userHighlight("┃"));
        return;
      case "assistant-message":
        console.log(assistantHighlight("┃ ASSISTANT:"));
        console.log(assistantHighlight("┃"));
        for (const line of item.content.split("\n")) {
          console.log(assistantHighlight("┃"), line);
        }
        console.log(assistantHighlight("┃"));
        return;
      case "edit":
        console.log(toolHighlight("┃ EDIT:"), item.fileName);
        console.log(toolHighlight("┃"));
        item.content.forEach((line) => {
          if (line.type === "added") {
            console.log(toolHighlight("┃"), diffAdded("+ " + line.content));
          } else if (line.type === "removed") {
            console.log(toolHighlight("┃"), diffRemoved("+ " + line.content));
          } else {
            console.log(toolHighlight("┃"), "  " + line.content);
          }
        });
        console.log(toolHighlight("┃"));
        return;
      case "read":
      case "write":
        console.log(
          toolHighlight(`┃ ${item.type.toUpperCase()}:`),
          item.fileName,
        );
        console.log(toolHighlight("┃"));
        for (const line of formatContent(item.content)) {
          console.log(toolHighlight("┃"), line);
        }
        console.log(toolHighlight("┃"));
        return;
      case "glob":
        console.log(toolHighlight("┃ GLOB:"), item.pattern);
        console.log(toolHighlight("┃"));
        for (const line of item.content.split("\n")) {
          console.log(toolHighlight("┃"), line);
        }
        console.log(toolHighlight("┃"));
        return;
      case "run":
        console.log(toolHighlight("┃"));
        console.log(
          toolHighlight("┃ RUN:"),
          item.programme,
          item.args.join(" "),
        );
        console.log(toolHighlight("┃"));
        for (const line of item.result.split("\n")) {
          console.log(toolHighlight("┃"), line);
        }
        console.log(toolHighlight("┃"));
        return;
      case "tool-result":
        console.log(toolHighlight("┃ TOOL RESULT:"));
        console.log(toolHighlight("┃"));
        for (const line of item.content.split("\n")) {
          console.log(toolHighlight("┃"), line);
        }
        console.log(toolHighlight("┃"));
        return;
    }
  },
};

function formatContent(content: string) {
  const split = content.split("\n");
  if (split.length < 4) {
    return split;
  }

  return [...split.slice(0, 4), "....."];
}
