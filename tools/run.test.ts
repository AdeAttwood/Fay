import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.177.1/testing/asserts.ts";
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
    "Programme cannot have spaces it in. Please ensure you use the programme and arguments.",
  );
});
