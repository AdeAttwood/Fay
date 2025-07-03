import { Input } from "@cliffy/prompt";
import { Command } from "@cliffy/command";

import { Agent } from "@fay/agent";
import { SessionManager } from "./session-manager.ts";
import { Configuration } from "../agent/config.ts";
import { printMessage } from "./printer.ts";

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
  .action(({ title }) => {
    if (typeof title === "undefined") {
      throw new Error("Session title is required");
    }

    const agent = Agent.new({ title });
    agent.saveSession();
  });

async function getInputFromEditor() {
  const editor = Deno.env.get("EDITOR") || "nvim";
  const tmpFile = await Deno.makeTempFile({ prefix: "fay-", suffix: ".prompt.md" });
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

async function prompt(agent: Agent) {
  const input = await Input.prompt({
    message: `Prompt input`,
    suggestions: [
      "/open",
      "/system",
    ],
  });

  switch (input) {
    case '/system':
      console.log(agent.session.messages[0].content);
      return undefined;

    case '/open':
      return await getInputFromEditor();

    default:
      return input;
  }
}

async function getInitalPrompt(agent: Agent, promptFile: string | undefined) {
  if (promptFile) {
    return await Deno.readTextFile(promptFile);
  }

  return prompt(agent);
}


const run = new Command()
  .description("Run the interactive agent")
  .option(
    "--prompt-file <string>",
    "A path to a file that contains the first prompt you want to use",
  )
  .action(async ({ promptFile }) => {
    const config = Configuration.find();
    const sessions = await new SessionManager("./.git/fay/sessions").list();
    const agent = new Agent(config, sessions[0]);

    for (const message of agent.session.messages) {
      printMessage(message);
    }

    const initalPrompt = await getInitalPrompt(agent, promptFile);
    if (initalPrompt) {
    for await (const message of agent.prompt(initalPrompt)) {
      printMessage(message);
    }
    }

    while (true) {
    const inputPrompt = await prompt(agent);
    if (inputPrompt) {
      for await (const message of agent.prompt(inputPrompt)) {
        printMessage(message);
      }
    }
  }
  });

await new Command()
  .name("fay")
  .default("run")
  .command("list", list)
  .command("new", newCommand)
  .command("run", run)
  .parse(Deno.args);
