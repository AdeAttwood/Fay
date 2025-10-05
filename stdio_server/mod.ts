import type { Reader, Writer } from "@std/io";

export class StdioServer {
  private buffer = new Uint8Array(1024);

  private readData = "";

  private decoder = new TextDecoder();

  private encoder = new TextEncoder();

  constructor(
    private input: Reader = Deno.stdin,
    private output: Writer = Deno.stdout,
    private logger: Writer = Deno.stderr,
  ) {}

  public write(data: string): undefined {
    this.output.write(this.encoder.encode(data));
  }

  public log(data: string): undefined {
    this.logger.write(this.encoder.encode(data));
  }

  public read = async function* read(this: StdioServer) {
    while (true) {
      const n = await this.input.read(this.buffer);
      if (n === null) break;

      this.readData += this.decoder.decode(this.buffer.subarray(0, n));

      let index = this.readData.indexOf("\n");
      while (index >= 0) {
        const line = this.readData.slice(0, index).trim();
        this.readData = this.readData.slice(index + 1);
        if (line.length > 0) yield line;

        index = this.readData.indexOf("\n");
      }
    }
  };
}
