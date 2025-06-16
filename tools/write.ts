import { tool } from "ai";
import path from "node:path";
import z from "zod";

export default tool({
  description: "Write data from a file",
  parameters: z.object({
    fileName: z.string().describe("The filename of the file you want to write"),
    content: z.string().describe("The content you want to write to the file"),
  }),
  execute: async ({ fileName, content }) => {
    await Deno.mkdir(path.dirname(fileName), { recursive: true });
    await Deno.writeTextFile(fileName, content);
  },
});
