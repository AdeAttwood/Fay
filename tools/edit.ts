import { tool } from "ai";
import z from "zod";

export default tool({
  description: "Edit a file by replacing a string with a new one.",
  parameters: z.object({
    fileName: z.string().describe("The filename of the file you want to edit."),
    oldContent: z.string().describe("The old string to be replaced."),
    newContent: z.string().describe("The new string to replace the old one."),
  }),
  execute: async ({ fileName, oldContent, newContent }) => {
    try {
      const fileContent = await Deno.readTextFile(fileName);
      const newFileContent = fileContent.replace(oldContent, newContent);
      await Deno.writeTextFile(fileName, newFileContent);
      return `Successfully edited ${fileName}`;
    } catch (error) {
      if (error instanceof Error) {
        return `Error editing file: ${error.message}`;
      }
      return `An unknown error occurred`;
    }
  },
});
