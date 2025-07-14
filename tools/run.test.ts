import { assertEquals } from "@std/assert";
import run from "./run.ts";
import type z from "zod";
import path from "node:path";

async function runTool(parameters: z.infer<typeof run.parameters>) {
  return await run.execute(
    parameters,
    { toolCallId: "run", messages: [] },
  );
}

Deno.test("Run Command in Subdirectory", async () => {
  const tempDir = await Deno.makeTempDir();
  const subDir = path.join(tempDir, "subdir");
  await Deno.mkdir(subDir);
  const filePath = path.join(subDir, "test.txt");
  await Deno.writeTextFile(filePath, "hello");

  const result = await runTool({
    programme: "deno",
    args: ["eval", "console.log(Deno.cwd())"],
    cwd: subDir,
  });

  assertEquals(result.trim(), subDir);

  await Deno.remove(tempDir, { recursive: true });
});
