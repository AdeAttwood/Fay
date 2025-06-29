import { assertEquals } from "@std/assert";
import read from "./read.ts";

async function runTool(fileName: string) {
  return await read.execute(
    { fileName },
    { toolCallId: "run", messages: [] },
  );
}

Deno.test("read tool should read file content", async () => {
  const fileName = "test_file.txt";
  await Deno.writeTextFile(fileName, "test content");
  const result = await runTool(fileName);
  assertEquals(result, "test content");
  await Deno.remove(fileName);
});

Deno.test("read tool should return an error message when the file is not found", async () => {
  const fileName = "non_existent_file.txt";
  const result = await runTool(fileName);
  assertEquals(result, "ERORR: file not found");
});

Deno.test("read tool should return an error message when the file is a directory", async () => {
  const fileName = "test_dir";
  await Deno.mkdir(fileName);
  const result = await runTool(fileName);
  assertEquals(result, `ERROR: '${fileName}' must be a file, directory found`);
  await Deno.remove(fileName, { recursive: true });
});
