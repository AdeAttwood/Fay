import { StdioServer } from "./mod.ts";
import { assertEquals } from "@std/assert";
import { Buffer } from "@std/io";

Deno.test("write method writes to output", () => {
  const output = new Buffer();
  const server = new StdioServer(undefined, output);
  server.write("test message");
  assertEquals(output.bytes(), new TextEncoder().encode("test message"));
});

Deno.test("log method writes to logger", () => {
  const logger = new Buffer();
  const server = new StdioServer(undefined, undefined, logger);
  server.log("log message");
  assertEquals(logger.bytes(), new TextEncoder().encode("log message"));
});

Deno.test("read method yields lines from input", async () => {
  const encoder = new TextEncoder();
  const input = new Buffer();
  input.write(encoder.encode("first line\nsecond line\n"));
  const server = new StdioServer(input);
  const lines: string[] = [];
  for await (const line of server.read()) {
    lines.push(line);
  }
  assertEquals(lines, ["first line", "second line"]);
});

Deno.test("read skips empty lines", async () => {
  const encoder = new TextEncoder();
  const input = new Buffer();
  input.write(encoder.encode("line1\n\nline2\n"));
  const server = new StdioServer(input);
  const lines: string[] = [];
  for await (const line of server.read()) {
    lines.push(line);
  }
  assertEquals(lines, ["line1", "line2"]);
});
