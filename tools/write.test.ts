import { assertEquals } from "https://deno.land/std@0.177.1/testing/asserts.ts";
import write from "./write.ts";

Deno.test("write tool", async () => {
  const fileName = "test.txt";
  const content = "hello world";

  // Call the write tool
  await write.execute(
    { fileName, content },
    { toolCallId: "run", messages: [] },
  );

  // Read the file and check if the content is correct
  const fileContent = await Deno.readTextFile(fileName);
  assertEquals(fileContent, content);

  // Clean up the file
  await Deno.remove(fileName);
});

Deno.test("write tool with subdir", async () => {
  const fileName = "subdir/test.txt";
  const content = "hello world";

  // Call the write tool
  await write.execute(
    { fileName, content },
    { toolCallId: "run", messages: [] },
  );

  // Read the file and check if the content is correct
  const fileContent = await Deno.readTextFile(fileName);
  assertEquals(fileContent, content);

  // Clean up the file
  await Deno.remove(fileName);
  await Deno.remove("subdir", { recursive: true });
});
