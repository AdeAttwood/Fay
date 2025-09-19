import { Input } from "@cliffy/prompt";
import { Command } from "@cliffy/command";

import { Agent } from "@fay/agent";
import { SessionManager } from "./session-manager.ts";
import { Configuration } from "../agent/config.ts";
import {
  consoleFormat,
  formatMessage,
  markdownFormat,
} from "./formatter/index.ts";

const list = new Command()
  .description("List all the session you have available")
  .action(async () => {
    const sessions = new SessionManager("./.git/fay/sessions");
    for (const session of await sessions.list()) {
      console.log(session.id, session.title, `(${session.createdAt})`);
    }
  });

const newCommand = new Command()
  .description("Create a new session")
  .option("--title <string>", "The title of the new session")
  .action(async ({ title }) => {
    let sessionTitle = title;
    if (typeof sessionTitle === "undefined") {
      sessionTitle = await Input.prompt("Session title");
    }

    if (typeof sessionTitle === "undefined") {
      throw new Error("Session title is required");
    }

    new SessionManager("./.git/fay/sessions");
    const agent = Agent.new({ title: sessionTitle });
    agent.saveSession();
  });

async function getInputFromEditor() {
  const editor = Deno.env.get("EDITOR") || "nvim";
  const tmpFile = await Deno.makeTempFile({
    prefix: "fay-",
    suffix: ".prompt.md",
  });
  await new Deno.Command(editor, {
    args: [tmpFile],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  }).output();

  const result = await Deno.readTextFile(tmpFile);
  await Deno.remove(tmpFile);

  return result;
}

async function getPrompt(agent: Agent) {
  const input = await Input.prompt({
    message: `Prompt input`,
    suggestions: [
      "/open",
      "/system",
      "/run",
    ],
  });

  switch (input) {
    case "/system":
      console.log(agent.session.messages[0].content);
      return undefined;

    case "/open":
      return await getInputFromEditor();
  }

  if (input.startsWith("/run")) {
    const commandString = input.substring(4);
    const shell = agent.config.shell();
    const args = [...shell.args, commandString];
    const result = await new Deno.Command(shell.command, { args }).output();

    return (
      "Run: " + commandString + "\n\n" + new TextDecoder().decode(result.stdout)
    );
  }

  return input;
}

async function getInitalPrompt(
  agent: Agent,
  prompt: string | undefined,
  promptFile: string | undefined,
) {
  if (prompt) {
    return prompt;
  }

  if (promptFile) {
    return await Deno.readTextFile(promptFile);
  }

  return getPrompt(agent);
}

const run = new Command()
  .description("Run the interactive agent")
  .option(
    "--prompt-file <string>",
    "A path to a file that contains the first prompt you want to use",
  )
  .option(
    "--prompt <string>",
    "Text to be used as the first prompt (overrides --prompt-file)",
  )
  .action(async ({ prompt, promptFile }) => {
    const config = Configuration.find();
    const sessions = await new SessionManager("./.git/fay/sessions").list();
    const agent = new Agent(config, sessions[0]);

    for (const message of agent.session.messages) {
      formatMessage(message, agent.session.messages, consoleFormat);
    }

    const initalPrompt = await getInitalPrompt(agent, prompt, promptFile);
    if (initalPrompt) {
      for await (const message of agent.prompt(initalPrompt)) {
        formatMessage(message, agent.session.messages, consoleFormat);
      }
    }

    while (true) {
      const inputPrompt = await getPrompt(agent);
      if (inputPrompt) {
        for await (const message of agent.prompt(inputPrompt)) {
          formatMessage(message, agent.session.messages, consoleFormat);
        }
      }
    }
  });

const markdown = new Command()
  .description("Print the session in markdown format")
  .action(async () => {
    const sessions = await new SessionManager("./.git/fay/sessions").list();
    for (const message of sessions[0].messages) {
      formatMessage(message, sessions[0].messages, markdownFormat);
    }
  });

await new Command()
  .name("fay")
  .default("run")
  .command("list", list)
  .command("new", newCommand)
  .command("md", markdown)
  .command("run", run)
  .parse(Deno.args);
