import { tool } from "ai";
import path from "node:path";
import z from "zod";

export default tool({
  description:
    "Write data to a file, optionally at a specific offset and length",
  parameters: z.object({
    fileName: z.string().describe("The filename of the file you want to write"),
    content: z.string().describe("The content you want to write to the file"),
    offset: z.number().optional().describe(
      "The offset at which to start writing (optional)",
    ),
    length: z.number().optional().describe(
      "The number of bytes to write (optional)",
    ),
  }),
  execute: async ({ fileName, content, offset, length }) => {
    await Deno.mkdir(path.dirname(fileName), { recursive: true });

    if (offset !== undefined && length !== undefined) {
      // Read the existing file content
      let existingContent = "";
      try {
        existingContent = await Deno.readTextFile(fileName);
      } catch (e) {
        if (!(e instanceof Deno.errors.NotFound)) {
          throw e;
        }
        // If the file doesn't exist, treat it as an empty string
      }

      // Calculate the start and end positions for the replacement
      const start = offset;
      const end = offset + length;

      // Perform the replacement
      const newContent = existingContent.substring(0, start) + content +
        existingContent.substring(end);

      // Write the modified content back to the file
      await Deno.writeTextFile(fileName, newContent);
    } else {
      // Write the entire content to the file
      await Deno.writeTextFile(fileName, content);
    }
  },
});
