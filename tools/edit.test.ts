import { assertEquals } from "@std/assert";
import edit from "./edit.ts";

Deno.test("edit tool", async () => {
  const testFile = await Deno.makeTempFile();
  await Deno.writeTextFile(testFile, "hello world");

  const result = await edit.execute(
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
