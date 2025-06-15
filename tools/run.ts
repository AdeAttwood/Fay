import { tool } from "ai";
import z from "zod";

export default tool({
  description: "Run a bash shell command",
  parameters: z.object({
    command: z.string().describe("The command you want to run"),
    args: z
      .array(z.string())
      .describe("The arguments you want to pass to the command"),
  }),
  execute: async ({ command, args }) => {
    const cmd = new Deno.Command(command, { args });
    const { stdout } = await cmd.output();
    return new TextDecoder().decode(stdout);
  },
});
