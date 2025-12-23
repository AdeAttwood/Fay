import { buildMessageText } from "./build_message.ts";
import { assertEquals } from "@std/assert";
import type { Context } from "./mod.ts";

Deno.test("Handles a basic message", () => {
  const result = buildMessageText(
    {
      log: (_: string) => {},
    } as Context,
    [
      { type: "text", text: "Can you add some comments to " },
      {
        type: "resource_link",
        name: "mod.ts (10:10)",
        uri:
          "zed:///agent/selection?path=D%3A%5CCode%5Csrc%5Cgithub.com%5CAdeAttwood%5CFay%5Cstdio_server%5Cmod.ts#L10:10",
      },
    ],
  );

  assertEquals(
    "Can you add some comments to  D:\\Code\\src\\github.com\\AdeAttwood\\Fay\\stdio_server\\mod.ts#L10:10",
    result,
  );
});

Deno.test("Handles multiple text blocks", () => {
  const result = buildMessageText(
    {
      log: (_: string) => {},
    } as Context,
    [
      { type: "text", text: "Hello " },
      { type: "text", text: "world!" },
    ],
  );

  assertEquals("Hello  world!", result);
});

Deno.test("Handles /agent/file resource link", () => {
  const result = buildMessageText(
    {
      log: (_: string) => {},
    } as Context,
    [
      {
        type: "resource_link",
        name: "test.txt",
        uri: "zed:///agent/file?path=C%3A%5Ctest.txt",
      },
    ],
  );

  assertEquals("C:\\test.txt", result);
});

Deno.test("Handles file:// resource link", () => {
  const result = buildMessageText(
    {
      log: (_: string) => {},
    } as Context,
    [
      {
        type: "resource_link",
        name: "journey-detection.md (31:31)",
        uri:
          "file:///D:/Code/src/github.com/Gl2Tech/FleetObserver/docs/services/archive/journey-detection.md#L31:31",
      },
    ],
  );

  assertEquals(
    "D:/Code/src/github.com/Gl2Tech/FleetObserver/docs/services/archive/journey-detection.md#L31:31",
    result,
  );
});

Deno.test("Handles file:// resource link without hash", () => {
  const result = buildMessageText(
    {
      log: (_: string) => {},
    } as Context,
    [
      {
        type: "resource_link",
        name: "journey-detection.md",
        uri:
          "file:///D:/Code/src/github.com/Gl2Tech/FleetObserver/docs/services/archive/journey-detection.md",
      },
    ],
  );

  assertEquals(
    "D:/Code/src/github.com/Gl2Tech/FleetObserver/docs/services/archive/journey-detection.md",
    result,
  );
});

Deno.test("Handles unknown protocol resource link", () => {
  const result = buildMessageText(
    {
      log: (_: string) => {},
    } as Context,
    [
      { type: "text", text: "Skip this: " },
      {
        type: "resource_link",
        name: "example",
        uri: "http://example.com",
      },
    ],
  );

  assertEquals("Skip this: ", result);
});

Deno.test("Handles empty blocks", () => {
  const result = buildMessageText(
    {
      log: (_: string) => {},
    } as Context,
    [],
  );

  assertEquals("", result);
});

Deno.test("Throws on unsupported content block type", () => {
  try {
    buildMessageText(
      {
        log: (_: string) => {},
      } as Context,
      [
        {
          type: "image",
          data: "test",
          mimeType: "image/png",
        },
      ],
    );
    throw new Error("Expected to throw");
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, "Unsupported content block type image");
    } else {
      throw error;
    }
  }
});
