import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import type { Configuration } from "./config.ts";

export function createProvider(modelName: string) {
  switch (modelName) {
    case "gemini-default":
      return google("gemini-2.0-flash");
    case "gemini-2.5-pro":
    case "gemini-2.0-flash":
      return google(modelName);

    case "claude-default":
      return anthropic("claude-sonnet-4-20250514");
    case "claude-3-sonnet-20240229":
    case "claude-3-5-sonnet-20241022":
    case "claude-3-7-sonnet-20250219":
    case "claude-sonnet-4-20250514":
    case "claude-opus-4-20250514":
      return anthropic(modelName);

    default:
      throw new Error(`Unable to infer model '${modelName}'`);
  }
}

export function inferProviderFromEnvironment(config: Configuration) {
  if (config.config.model) {
    return createProvider(config.config.model);
  }

  if (Deno.env.has("GOOGLE_GENERATIVE_AI_API_KEY")) {
    return createProvider("gemini-default");
  }

  throw new Error(`Unable to infer model from the environment`);
}

export default createProvider;
