import { tool } from "ai";
import z from "zod";

export default tool({
  description: "Read data from a file",
  parameters: z.object({
    fileName: z.string().describe("The filename of the file you want ot read"),
  }),
  execute: async ({ fileName }) => {
    return await Deno.readTextFile(fileName);
  },
});
