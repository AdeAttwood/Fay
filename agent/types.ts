export type InternalMessage =
  | InternalUserMessage & MessageUsage
  | InternalAssistantMessage & MessageUsage
  | InternalToolMessage & MessageUsage
  | InternalSystemMessage & MessageUsage;

export type MessageUsage = {
  usage?: {
    inputTokens: number | undefined;
    outputTokens: number | undefined;
    totalTokens: number | undefined;
  };
};

export type InternalUserContent = string | string[];

export interface InternalToolCallPart {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  args: unknown;
}

export interface InternalToolResultPart {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  result: string;
}

export interface InternalTextPart {
  type: "text";
  text: string;
}

export type InternalSystemMessage = {
  role: "system";
  content: string;
};

export type InternalUserMessage = {
  role: "user";
  content: InternalUserContent;
};

export type InternalAssistantMessage = {
  role: "assistant";
  content: string | Array<InternalTextPart | InternalToolCallPart>;
};

export type InternalToolMessage = {
  role: "tool";
  content: Array<InternalToolResultPart>;
};
