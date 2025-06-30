import type { CoreAssistantMessage, CoreMessage, CoreToolMessage } from "ai";
import { colors } from "@cliffy/ansi/colors";

const userHighlight = colors.yellow.bold;
const assistantHighlight = colors.green.bold;
const toolHighlight = colors.magenta.bold;
const diffAdded = colors.green;
const diffRemoved = colors.red;

function formatContent(content: string) {
  const split = content.split("\n");
  if (split.length < 4) {
    return split;
  }

  return [...split.slice(0, 4), "....."];
}

function printDiff(oldText: string, newText: string) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

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
      console.log(toolHighlight("┃"), diffRemoved(`-${oldLines[oldIndex]}`));
      oldIndex++;
    }
    while (newIndex < newLines.length && newLines[newIndex] !== line) {
      console.log(toolHighlight("┃"), diffAdded(`+${newLines[newIndex]}`));
      newIndex++;
    }

    console.log(toolHighlight("┃"), line);
    oldIndex++;
    newIndex++;
  }

  while (oldIndex < oldLines.length) {
    console.log(toolHighlight("┃"), diffRemoved(`-${oldLines[oldIndex]}`));
    oldIndex++;
  }

  while (newIndex < newLines.length) {
    console.log(toolHighlight("┃"), diffAdded(`+${newLines[newIndex]}`));
    newIndex++;
  }
}

function printAssistantMessage(message: CoreAssistantMessage) {
  if (typeof message.content === "string") {
    console.log(assistantHighlight("┃ ASSISTANT:"));
    for (const line of message.content.split("\n")) {
      console.log(assistantHighlight("┃ "), line);
    }

    return;
  }

  message.content.forEach((c) => {
    if (c.type === "text") {
      console.log(assistantHighlight("┃ ASSISTANT:"));
      for (const line of c.text.split("\n")) {
        console.log(assistantHighlight("┃ "), line);
      }
    }

    if (c.type === "tool-call") {
      if (
        c.toolName === "edit" &&
        typeof c.args === "object" &&
        c.args !== null &&
        "fileName" in c.args &&
        "newContent" in c.args &&
        "oldContent" in c.args &&
        typeof c.args.oldContent === "string" &&
        typeof c.args.newContent === "string"
      ) {
        console.log(toolHighlight("┃ TOOL CALL:"), `edit(${c.args.fileName})`);
        printDiff(c.args.oldContent, c.args.newContent);

        return;
      }

      return console.log(
        toolHighlight("┃ TOOL CALL:"),
        `${c.toolName}(${JSON.stringify(c.args)});`,
      );
    }
  });
}

function printToolMessage(message: CoreToolMessage) {
  message.content.forEach((c) => {
    const stringResult = typeof c.result === "string"
      ? c.result
      : JSON.stringify(c.result || "", undefined, 2);

    if (stringResult.trim().length === 0) {
      return;
    }

    console.log(toolHighlight("┃ TOOL RESULT:"));
    for (const line of formatContent(stringResult)) {
      console.log(toolHighlight("┃ "), line);
    }
  });
}

export function printMessage(message: CoreMessage) {
  switch (message.role) {
    case "user":
      console.log(userHighlight("┃ USER:"), message.content);
      break;
    case "assistant":
      printAssistantMessage(message);
      break;
    case "tool":
      printToolMessage(message);
      break;
  }
}
