import { assert, assertEquals } from "@std/assert";
import run from "./run.ts";

async function runTool(programme: string, args: string[]) {
  return await run.execute(
    { programme, args },
    { toolCallId: "run", messages: [] },
  );
}

Deno.test("run tool", async () => {
  const result = await runTool("deno", ["--help"]);
  assert(result.includes("Deno: A modern JavaScript and TypeScript runtime"));
});

Deno.test("if the command does not exist", async () => {
  const result = await runTool("not-a-command", ["--help"]);
  assertEquals(result, "The programme 'not-a-command' is not found");
});

Deno.test("command with a space", async () => {
  const result = await runTool("ls -al", []);
  assertEquals(
    result,
    "Programme name cannot contain spaces. Provide the executable and its arguments separately.",
  );
});
