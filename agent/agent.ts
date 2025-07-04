import { Session } from "./session.ts";
import { buildSystemPrompt } from "./prompt/index.ts";

import { inferProviderFromEnvironment } from "./provider.ts";
import tools from "@fay/tools";
import { type CoreMessage, type CoreUserMessage, streamText } from "ai";
import { Configuration } from "./config.ts";

export type NewAgentOptions = {
  title: string;
};

export class Agent {
  /**
   * @param session The session to use for the agent.
   */
  constructor(
    public readonly config: Configuration,
    public readonly session: Session,
  ) {
    this.prompt = this.prompt.bind(this);
  }

  /**
   * Creates a new agent.
   * @returns A new agent.
   */
  public static new(options: NewAgentOptions) {
    const config = Configuration.find();

    return new Agent(
      config,
      new Session(
        crypto.randomUUID(),
        new Date().getTime(),
        options.title,
        inferProviderFromEnvironment(config),
        [{ role: "system", content: buildSystemPrompt(config) }],
      ),
    );
  }

  public saveSession() {
    this.session.save(`./.git/fay/sessions/${this.session.id}.json`);
  }

  /**
   * Prompts the agent with a message.
   * @param content The message to prompt the agent with.
   * @returns A stream of messages from the agent.
   */
  public prompt = async function* prompt(this: Agent, content: string) {
    const userMessage: CoreUserMessage = { role: "user", content };
    this.session.messages.push(userMessage);

    this.session.messages[0] = {
      role: "system",
      content: buildSystemPrompt(this.config),
    };

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
      onFinish: () => {
        this.saveSession();
      },
      onError: (error) => {
        throw new Error(
          `Processing error: ${
            "message" in error ? error.message : JSON.stringify(error)
          }`,
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
