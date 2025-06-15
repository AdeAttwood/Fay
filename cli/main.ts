import type { CoreAssistantMessage, CoreMessage, CoreToolMessage } from "ai";
import { Input } from "@cliffy/prompt";
import { colors } from "@cliffy/ansi/colors";

import { Agent } from "@agent/agent";

const userHighlight = colors.yellow.bold;
const assistantHighlight = colors.green.bold;
const toolHighlight = colors.magenta.bold;

function formatContent(content: string) {
  const split = content.split("\n");
  if (split.length < 4) {
    return split;
  }

  return [...split.slice(0, 4), "....."];
}

function printAssistantMessage(message: CoreAssistantMessage) {
  if (typeof message.content === "string") {
    console.log(assistantHighlight("┃ ASSISTANT:"));
    for (const line of formatContent(message.content)) {
      console.log(assistantHighlight("┃ "), line);
    }

    return;
  }

  message.content.forEach((c) => {
    if (c.type === "text") {
      console.log(assistantHighlight("┃ ASSISTANT:"));
      for (const line of formatContent(c.text)) {
        console.log(assistantHighlight("┃ "), line);
      }
    }

    if (c.type === "tool-call") {
      return console.log(
        toolHighlight("┃ TOOL CALL:"),
        `${c.toolName}(${JSON.stringify(c.args)});`,
      );
    }
  });
}

function printToolMessage(message: CoreToolMessage) {
  message.content.forEach((c) => {
    console.log(toolHighlight("┃ TOOL RESULT:"));
    const stringResult = typeof c.result === "string"
      ? c.result
      : JSON.stringify(c.result || "", undefined, 2);

    for (const line of formatContent(stringResult)) {
      console.log(toolHighlight("┃ "), line);
    }
  });
}

function printMessage(message: CoreMessage) {
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

const agent = Agent.new();
while (true) {
  const prompt = await Input.prompt(`Prompt input`);
  for await (const message of agent.prompt(prompt)) {
    printMessage(message);
  }
}
