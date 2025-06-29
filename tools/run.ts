import { tool } from "ai";
import z from "zod";

export default tool({
  description: "Run a bash shell command",
  parameters: z.object({
    programme: z.string().describe(
      "The programme to execute (e.g., 'ls', 'pwd')",
    ),
    args: z
      .array(z.string())
      .describe(
        "An array of arguments to pass to the command (e.g., ['-l', '-a'])",
      ),
  }),
  execute: async ({ programme, args }) => {
    if (programme.includes(" ")) {
      return "Programme name cannot contain spaces. Provide the executable and its arguments separately.";
    }

    const cmd = new Deno.Command(programme, {
      args,
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
        return `Command failed with code ${code}: ${stderrText}`;
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
