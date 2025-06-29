import { tool } from "ai";
import z from "zod";

export default tool({
  description: "Read data from a file",
  parameters: z.object({
    fileName: z.string().describe("The filename of the file you want ot read"),
  }),
  execute: async ({ fileName }) => {
    try {
      const stats = await Deno.lstat(fileName);
      if (stats.isFile) {
        return await Deno.readTextFile(fileName);
      }

      return `ERROR: '${fileName}' must be a file, directory found`;
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        throw err;
      }

      return "ERORR: file not found";
    }
  },
});
