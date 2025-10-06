import path from "node:path";

export interface AgentConfig {
  /**
   * The name of the model to use for the agent. A list of models can be found
   * in provider.ts.
   */
  model?: string;
  /**
   * Context files for the agent. These are files that provide additional
   * context to the agent, they are usually project specific.
   *
   * The default value is `["AGENTS.md"]`, this will find it in the root of the
   * agent context.
   */
  contextFiles?: string[];
  /**
   * The shell to run commands in. The command string to run will be added as a
   * single argument at the end of the args.
   *
   * For example:
   *
   * { command: "bash", args: "-c" }
   *
   * Will produce the command
   *
   * bash -c "ls -al"
   */
  shell?: {
    command: string;
    args: string[];
  };
}

export class Configuration {
  constructor(public readonly config: AgentConfig) {}

  public static find(baseDir: string = Deno.cwd()): Configuration {
    return new Configuration(Configuration.configContent(baseDir));
  }

  private static configContent(baseDir: string = Deno.cwd()): AgentConfig {
    const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
    if (!home) {
      throw new Error(
        "Unable to find home directory. Please set the HOME or USERPROFILE environment variable.",
      );
    }

    const candidates = [];

    // The FAY_CONFIG environment variable takes precedence
    if (Deno.env.has("FAY_CONFIG")) {
      candidates.push(Deno.env.get("FAY_CONFIG")!);
    }

    candidates.push(path.join(baseDir, ".git", "fay", "fay.json"));
    candidates.push(path.join(baseDir, ".fay.json"));

    if (Deno.env.has("APPDATA")) {
      candidates.push(path.join(Deno.env.get("APPDATA")!, "fay", "fay.json"));
    }

    candidates.push(path.join(home, ".config", "fay", "fay.json"));
    candidates.push(path.join(home, ".fay.json"));

    for (const candidate of candidates) {
      try {
        const content = Deno.readTextFileSync(candidate);
        return JSON.parse(content) as AgentConfig;
      } catch (_error) {
        return {};
      }
    }

    return {};
  }

  public contextFiles(): string[] {
    return this.config.contextFiles || ["AGENTS.md"];
  }

  public shell() {
    return (
      this.config.shell ?? {
        command: "nu",
        args: ["-c"],
      }
    );
  }
}
