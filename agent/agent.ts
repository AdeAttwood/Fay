import { Session } from "./session.ts";
import systemPrompt from "./prompt.ts";
import { createProvider, inferProviderFromEnvironment } from "./provider.ts";
import tools from "@agent/tools";
import { type CoreMessage, type CoreUserMessage, streamText } from "ai";

export class Agent {
  private constructor(private session: Session) {
    this.prompt = this.prompt.bind(this);
  }

  public static new() {
    return new Agent(
      new Session(inferProviderFromEnvironment(), [
        { role: "system", content: systemPrompt },
      ]),
    );
  }

  public static async load(file: string) {
    const sessionData = JSON.parse(await Deno.readTextFile(file));
    return new Agent(
      new Session(createProvider(sessionData.model), sessionData.messages),
    );
  }

  public async save(file: string) {
    await Deno.writeTextFile(
      file,
      JSON.stringify({
        model: this.session.model.modelId,
        messages: this.session.messages,
      }),
    );
  }

  public prompt = async function* prompt(this: Agent, content: string) {
    const userMessage: CoreUserMessage = { role: "user", content };
    this.session.messages.push(userMessage);

    yield userMessage;

    const messageQueue: Array<CoreMessage> = [];

    const result = streamText({
      model: this.session.model,
      messages: this.session.messages,
      maxSteps: 1000,
      tools,
      toolCallStreaming: true,
      onStepFinish: (step) => {
        for (const message of step.response.messages) {
          const existing = this.session.messages.find(
            (m) => "id" in m && m.id == message.id,
          );

          if (!existing) {
            this.session.messages.push(message);
            messageQueue.push(message);
          }
        }
      },
      // onFinish: () => {},
      onError: (error) => {
        throw new Error(
          `Processing error: ${"message" in error ? error.message : "Unknown"}`,
        );
      },
    });

    for await (const _value of result.fullStream) {
      while (messageQueue.length > 0) {
        const nextMessage = messageQueue.shift()!;
        yield nextMessage;
      }
    }

    while (messageQueue.length > 0) {
      const nextMessage = messageQueue.shift()!;
      yield nextMessage;
    }
  };
}
