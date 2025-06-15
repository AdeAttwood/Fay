import type { CoreMessage, LanguageModel } from "ai";

type Messages = Array<CoreMessage>;

export class Session {
  constructor(
    public readonly model: LanguageModel,
    public readonly messages: Messages = [],
  ) {}
}
