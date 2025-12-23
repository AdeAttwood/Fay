import { tool } from "ai";
import z from "zod";

export default tool({
  description: "Edit a file by replacing a string with a new one.",
  inputSchema: z.object({
    fileName: z.string().describe("The filename of the file you want to edit."),
    oldContent: z.string().describe("The old string to be replaced."),
    newContent: z.string().describe("The new string to replace the old one."),
  }),
  execute: async ({ fileName, oldContent, newContent }) => {
    try {
      const fileContent = (await Deno.readTextFile(fileName)).replace(
        /\r\n/g,
        "\n",
      );

      if (!fileContent.includes(oldContent.replace(/\r\n/g, "\n"))) {
        return `Error: The old string is not in ${fileName}`;
      }

      const newFileContent = fileContent.replace(
        oldContent.replace(/\r\n/g, "\n"),
        newContent.replace(/\r\n/g, "\n"),
      );

      if (fileContent === newFileContent) {
        return "Error: edit has not been made, try reading the file again";
      }

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
