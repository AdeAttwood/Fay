import type { Reader, Writer } from "@std/io";

/**
 * A server for handling standard input/output communication via stdio.
 */
export class StdioServer {
  /**
   * Buffer used for reading data from the input stream.
   */
  private buffer = new Uint8Array(1024);

  /**
   * Accumulates partial read data as a string before parsing into lines.
   */
  private readData = "";

  /**
   * Decodes bytes from the buffer into strings.
   */
  private decoder = new TextDecoder();

  /**
   * Encodes strings into bytes for writing to streams.
   */
  private encoder = new TextEncoder();

  /**
   * Creates a new StdioServer instance.
   * @param input The reader for input, defaults to Deno.stdin.
   * @param output The writer for output, defaults to Deno.stdout.
   * @param logger The writer for logging, defaults to Deno.stderr.
   */
  constructor(
    private input: Reader = Deno.stdin,
    private output: Writer = Deno.stdout,
    private logger: Writer = Deno.stderr,
  ) {}

  /**
   * Writes data to the output stream.
   * @param data The string data to write.
   */
  public write(data: string): undefined {
    this.output.write(this.encoder.encode(data));
  }

  /**
   * Writes data to the logger stream.
   * @param data The string data to log.
   */
  public log(data: string): undefined {
    this.logger.write(this.encoder.encode(data));
  }

  /**
   * Reads lines from the input stream asynchronously.
   * Yields each line as a string.
   */
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
