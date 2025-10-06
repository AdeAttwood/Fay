import type * as Schema from "./schema.ts";
import type { Agent } from "@fay/agent";

export class State {
  public clientCapabilities?: Schema.ClientCapabilities;
  public agents: Map<string, Agent> = new Map();
}
