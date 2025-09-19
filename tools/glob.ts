import { tool } from "ai";
import z from "zod";
import { expandGlobSync } from "@std/fs/expand-glob";

export default tool({
  description:
    "Find files by matching a glob pattern, this can be used to list files too using `*` as the pattern",
  inputSchema: z.object({
    pattern: z.string().describe(
      "The glob pattern to match files (e.g., '*', '*.txt', 'src/**/*.js')",
    ),
  }),
  // The execute function needs to be async
  // deno-lint-ignore require-await
  execute: async ({ pattern }) => {
    if (!pattern) {
      return "The pattern cannot be empty. Please provide a valid glob pattern.";
    }

    const entries = [];
    for (
      const entry of expandGlobSync(pattern, {
        exclude: ["**/node_modules/**", "**/.git/**", "**/obj/**", "**/bin/**"],
      })
    ) {
      const prefix = entry.isDirectory ? "dir: " : "file: ";
      entries.push(prefix + entry.path);
    }

    return entries.join("\n");
  },
});
