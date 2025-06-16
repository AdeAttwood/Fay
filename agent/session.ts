import type { CoreMessage, LanguageModel } from "ai";
import createProvider from "./provider.ts";

type Messages = Array<CoreMessage>;

export class Session {
  /**
   * @param model The language model to use for the session.
   * @param messages The messages in the session.
   */
  constructor(
    public readonly id: string,
    public readonly createdAt: number,
    public readonly title: string,
    public readonly model: LanguageModel,
    public readonly messages: Messages = [],
  ) {}

  /**
   * Loads a session from a file.
   * @param file The file to load the session from.
   * @returns A new session.
   */
  public static async load(file: string) {
    const sessionData = JSON.parse(await Deno.readTextFile(file));
    return new Session(
      sessionData.id,
      sessionData.createdAt,
      sessionData.title,
      createProvider(sessionData.model),
      sessionData.messages,
    );
  }

  /**
   * Saves the session to a file.
   * @param file The file to save the session to.
   */
  public async save(file: string) {
    await Deno.writeTextFile(
      file,
      JSON.stringify({
        id: this.id,
        createdAt: this.createdAt,
        title: this.title,
        model: this.model.modelId,
        messages: this.messages,
      }),
    );
  }
}
