import type { Context } from "./mod.ts";
import type * as Schema from "./schema.ts";

export function buildMessageText(
  context: Context,
  blocks: Schema.ContentBlock[],
): string {
  const message: string[] = [];

  for (const block of blocks) {
    if (block.type == "text") {
      message.push(block.text);
      continue;
    }

    if (block.type == "resource_link") {
      const url = new URL(block.uri);

      if (url.protocol == "zed:" && url.pathname == "/agent/file") {
        const path = url.searchParams.get("path");
        if (path) message.push(path);
      } else if (url.protocol == "zed:" && url.pathname == "/agent/selection") {
        const path = url.searchParams.get("path");
        if (path) message.push(path + url.hash);
      } else {
        context.log(`Skipping unknown resource link ${JSON.stringify(block)}`);
      }

      continue;
    }

    throw new Error(`Unsupported content block type ${block.type}`);
  }

  return message.join(" ");
}
