import path from "node:path";

export interface AgentConfig {
  /**
   * The name of the model to use for the agent. A list of models can be found
   * in provider.ts.
   */
  model?: string;
}

export class Configuration {
  constructor(public readonly config: AgentConfig) {
  }

  public static find(): Configuration {
    return new Configuration(Configuration.configContent());
  }

  private static configContent(): AgentConfig {
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

    candidates.push(path.join(Deno.cwd(), ".git", "fay", "fay.json"));
    candidates.push(path.join(Deno.cwd(), ".fay.json"));

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
}
