import { assert, assertEquals } from "@std/assert";
import glob from "./glob.ts";

async function runTool(pattern: string) {
  return await glob.execute(
    { pattern },
    { toolCallId: "run", messages: [] },
  );
}

Deno.test("glob tool should find files matching the pattern", async () => {
  await Deno.mkdir("test_glob_dir", { recursive: true });
  await Deno.writeTextFile("test_glob_dir/file1.txt", "content1");
  await Deno.writeTextFile("test_glob_dir/file2.js", "content2");
  await Deno.mkdir("test_glob_dir/subdir", { recursive: true });
  await Deno.writeTextFile("test_glob_dir/subdir/file3.txt", "content3");

  const result = await runTool("test_glob_dir/**/*.txt");

  assert(result.includes("test_glob_dir"), "includes test_glob_dir");
  assert(result.includes("subdir"), "includes subdir");

  assert(result.includes("file1.txt"), "includes file1.txt");
  assert(result.includes("file3.txt"), "includes file3.txt");

  assert(!result.includes("file2.js"), "does not include file2.js");

  await Deno.remove("test_glob_dir", { recursive: true });
});

Deno.test("glob tool should ignore excluded directories", async () => {
  await Deno.mkdir("test_glob_dir/node_modules", { recursive: true });
  await Deno.writeTextFile("test_glob_dir/node_modules/file.txt", "content");
  await Deno.mkdir("test_glob_dir/.git", { recursive: true });
  await Deno.writeTextFile("test_glob_dir/.git/file.txt", "content");
  await Deno.mkdir("test_glob_dir/obj", { recursive: true });
  await Deno.writeTextFile("test_glob_dir/obj/file.txt", "content");
  await Deno.mkdir("test_glob_dir/bin", { recursive: true });
  await Deno.writeTextFile("test_glob_dir/bin/file.txt", "content");
  await Deno.writeTextFile("test_glob_dir/file.txt", "content");

  const result = await runTool("test_glob_dir/**/*.txt");

  assert(result.includes("file.txt"), "includes file.txt");
  assert(!result.includes("node_modules"), "does not include node_modules");
  assert(!result.includes(".git"), "does not include .git");
  assert(!result.includes("obj"), "does not include obj");
  assert(!result.includes("bin"), "does not include bin");

  await Deno.remove("test_glob_dir", { recursive: true });
});

Deno.test("glob tool should return an empty string when no files match", async () => {
  const result = await runTool("non_existent_dir/**/*.txt");
  assertEquals(result, "");
});

Deno.test("glob tool should return an error message for an empty pattern", async () => {
  const result = await runTool("");
  assertEquals(
    result,
    "The pattern cannot be empty. Please provide a valid glob pattern.",
  );
});
