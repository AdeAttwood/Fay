import { StdioServer } from "@fay/stdio_server";
import { State } from "./state.ts";
import { JsonRpcClient, JsonRpcService } from "@adeattwood/js-json-rpc";
import { Handlers } from "./rpc_server.ts";
import type * as Schema from "./schema.ts";

export type Context = {
  state: State;
  log: (message: string) => void;
  client: JsonRpcClient<{
    [Schema.CLIENT_METHODS.session_update]: (
      request: Schema.SessionNotification,
    ) => void;
  }>;
};

export class Server {
  private stdioServer = new StdioServer();
  private state = new State();
  private rpc = new JsonRpcService(Handlers);

  public async run() {
    const client = new JsonRpcClient();
    client.sender = (request) => {
      this.stdioServer.write(JSON.stringify(request) + "\n");
    };

    for await (const line of this.stdioServer.read()) {
      try {
        this.log(line + "\n");

        const response = await this.rpc.handel(JSON.parse(line), {
          client,
          state: this.state,
          log: this.log.bind(this),
        });

        this.log("Writing " + JSON.stringify(response) + "\n");
        this.stdioServer.write(JSON.stringify(response) + "\n");
      } catch (e) {
        this.log(`Unable error ${e}\n`);
      }
    }

    this.log("Shutting down server");
  }

  log(message: string) {
    this.stdioServer.log("[Fay] " + message + "\n");
  }
}
