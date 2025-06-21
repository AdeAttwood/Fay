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

    const cmd = new Deno.Command(programme, { args });

    try {
      const { stdout } = await cmd.output();
      return new TextDecoder().decode(stdout);
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
