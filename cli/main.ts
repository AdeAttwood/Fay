import { Input } from "@cliffy/prompt";
import { Select } from "@cliffy/prompt/select";
import { Command } from "@cliffy/command";

import { Agent, SessionManager } from "@fay/agent";
import { Server } from "@fay/agent_client_protocol";
import { AgentConfig, Configuration } from "../agent/config.ts";
import { consoleFormat, formatMessage, markdownFormat } from "@fay/formatter";
import { providers } from "../agent/provider.ts";

const list = new Command()
  .description("List all the session you have available")
  .action(async () => {
    const sessions = new SessionManager("./.git/fay/sessions");
    for (const session of await sessions.list()) {
      console.log(session.id, session.title, `(${session.createdAt})`);
    }
  });

const model = new Command()
  .description("List all available models")
  .action(async () => {
    const model = await Select.prompt({
      message: "Choose a new model",
      options: providers.map((p) => ({ name: p.display, value: p.id })),
    });

    let config: AgentConfig = {};
    try {
      config = JSON.parse(Deno.readTextFileSync("./.git/fay/fay.json"));
    } catch {
      config = {};
    }

    config.model = model;

    Deno.writeTextFileSync(
      "./.git/fay/fay.json",
      JSON.stringify(config, undefined, 2),
    );
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
    message: `Prompt input (${agent.config.config.model})`,
    suggestions: ["/open", "/system", "/run"],
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

async function getInitialPrompt(
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

    const initialPrompt = await getInitialPrompt(agent, prompt, promptFile);
    if (initialPrompt) {
      for await (const message of agent.prompt(initialPrompt)) {
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

const stdio = new Command()
  .description("Run the agent in stdio mode using the agent client protocol")
  .action(async () => {
    await new Server().run();
  });

await new Command()
  .name("fay")
  .default("run")
  .command("list", list)
  .command("stdio", stdio)
  .command("new", newCommand)
  .command("md", markdown)
  .command("model", model)
  .command("run", run)
  .parse(Deno.args);
