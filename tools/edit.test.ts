import { assertEquals } from "@std/assert";
import edit from "./edit.ts";

Deno.test("edit tool", async () => {
  const testFile = await Deno.makeTempFile();
  await Deno.writeTextFile(testFile, "hello world");

  const result = await edit.execute?.(
    {
      fileName: testFile,
      oldContent: "world",
      newContent: "deno",
    },
    { toolCallId: "edit", messages: [] },
  );

  assertEquals(result, `Successfully edited ${testFile}`);
  const newContent = await Deno.readTextFile(testFile);
  assertEquals(newContent, "hello deno");

  await Deno.remove(testFile);
});

Deno.test("edit tool with unix line endings", async () => {
  const testFile = await Deno.makeTempFile();
  await Deno.writeTextFile(testFile, "hello world\r\nSome content");

  const result = await edit.execute?.(
    {
      fileName: testFile,
      oldContent: "hello world\nSome",
      newContent: "my\nnew",
    },
    { toolCallId: "edit", messages: [] },
  );

  assertEquals(result, `Successfully edited ${testFile}`);
  const newContent = await Deno.readTextFile(testFile);
  assertEquals(newContent, "my\nnew content");

  await Deno.remove(testFile);
});

Deno.test("edit tool with mixed line endings", async () => {
  const testFile = await Deno.makeTempFile();
  await Deno.writeTextFile(testFile, "hello world\r\nSome content");

  const result = await edit.execute?.(
    {
      fileName: testFile,
      oldContent: "hello world\r\nSome",
      newContent: "my\nnew",
    },
    { toolCallId: "edit", messages: [] },
  );

  assertEquals(result, `Successfully edited ${testFile}`);
  const newContent = await Deno.readTextFile(testFile);
  assertEquals(newContent, "my\nnew content");

  await Deno.remove(testFile);
});

Deno.test("edit tool with mixed line endings in the old content", async () => {
  const testFile = await Deno.makeTempFile();
  await Deno.writeTextFile(testFile, "hello world\nSome content");

  const result = await edit.execute?.(
    {
      fileName: testFile,
      oldContent: "hello world\r\nSome",
      newContent: "my\nnew",
    },
    { toolCallId: "edit", messages: [] },
  );

  assertEquals(result, `Successfully edited ${testFile}`);
  const newContent = await Deno.readTextFile(testFile);
  assertEquals(newContent, "my\nnew content");

  await Deno.remove(testFile);
});
