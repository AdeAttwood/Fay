import { assertEquals } from "https://deno.land/std@0.208.0/assert/assert_equals.ts";
import writeTool from "./write.ts";

Deno.test("Write entire file", async () => {
  const fileName = "test_file.txt";
  const content = "Hello, world!";

  await writeTool.execute({ fileName, content }, {
    toolCallId: "write",
    messages: [],
  });

  const actualContent = await Deno.readTextFile(fileName);
  assertEquals(actualContent, content);

  await Deno.remove(fileName);
});

Deno.test("Write part of file", async () => {
  const fileName = "test_file.txt";
  const initialContent = "This is the initial content.";
  await Deno.writeTextFile(fileName, initialContent);

  const content = "REPLACED";
  const offset = 5;
  const length = 2;

  await writeTool.execute({ fileName, content, offset, length }, {
    toolCallId: "write",
    messages: [],
  });

  const actualContent = await Deno.readTextFile(fileName);
  assertEquals(actualContent, "This REPLACED the initial content.");

  await Deno.remove(fileName);
});
