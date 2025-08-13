import { assertEquals, assertNotEquals } from "@std/assert";
import { which } from "./mod.ts";

Deno.test("finds an existing tool", () => {
  const denoPath = which("deno");
  assertNotEquals(denoPath, undefined);
});

Deno.test("does not find a nonexistent tool", () => {
  assertEquals(which("nonexistent-tool-for-sure"), undefined);
});
