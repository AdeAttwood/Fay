import { tool } from "ai";
import z from "zod";

export default tool({
  description: "Run a bash shell command",
  parameters: z.object({
    programme: z.string().describe(
      "The programme to execute (e.g., 'ls', 'pwd')",
    ),
    args: z.union([
      z.array(z.string()),
      z.string(),
    ])
      .describe(
        "An array of arguments to pass to the command (e.g., ['-l', '-a'])",
      ),
    cwd: z.string().optional().describe(
      "The current working directory to run the command in, this can be used instead of running the `cd` command",
    ),
  }),
  execute: async ({ programme, args: inputArgs, cwd }) => {
    if (programme.includes(" ")) {
      return "Programme name cannot contain spaces. Provide the executable and its arguments separately.";
    }

    let args = inputArgs;
    if (typeof inputArgs === "string" && inputArgs.startsWith("[")) {
      args = JSON.parse(inputArgs);
    }

    if (!Array.isArray(args)) {
      args = [args];
    }

    const cmd = new Deno.Command(programme, {
      args,
      cwd,
      stdout: "piped",
      stderr: "piped",
    });

    try {
      const { code, stdout, stderr } = await cmd.output();
      const stdoutText = new TextDecoder().decode(stdout);
      const stderrText = new TextDecoder().decode(stderr);

      if (code === 0) {
        return stdoutText;
      } else {
        return `Command failed with code ${code}: ${stdoutText}${stderrText}`;
      }
    } catch (e) {
      if (typeof e == "object" && e !== null && "code" in e) {
        switch (e.code) {
          case "ENOENT":
            return `The programme '${programme}' is not found`;
        }
      }

      return String(e);
    }
  },
});
