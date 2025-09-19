import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import type { Configuration } from "./config.ts";

// http get https://models.dev/api.json | values | each { |provider|
//   $provider.models | values | each { |model|
//     {
//       id: $"($provider.id)/($model.id)",
//       provider: $provider.id,
//       model: $model.id,
//       display: $"($provider.name) / ($model.name)",
//       cost: ($model | get -i cost | default {}),
//     }
//   }
// }
// | flatten
// | where provider == "google" or provider == "opencode" or provider == "anthropic"
// | to json
// | save -f ./agent/providers.json
import providersConfig from "./providers.json" with { type: "json" };

const ALIASES: Record<string, string> = {
  // Default model aliases
  "google-default": "google/gemini-2.0-flash",
  "claude-default": "anthropic/claude-sonnet-4-20250514",

  // Old model names for BC
  "gemini-2.5-pro": "google/gemini-2.5-pro",
  "gemini-2.0-flash": "google/gemini-2.0-flash",
  "claude-sonnet-4-20250514": "anthropic/claude-sonnet-4-20250514",
  "claude-3-sonnet-20240229": "anthropic/claude-3-sonnet-20240229",
};

export const providers = providersConfig;

export function createProvider(modelName: string) {
  const model = modelName in ALIASES ? ALIASES[modelName] : modelName;
  const config = providersConfig.find((p) => p.id == model);
  if (!config) {
    throw new Error(`Unable to infer model '${modelName}'`);
  }

  switch (config.provider) {
    case "google":
      return google(config.model);

    case "anthropic":
      return anthropic(config.model);

    default:
      throw new Error(`Model '${modelName}' is not configured correctly.`);
  }
}

export function inferProviderFromEnvironment(config: Configuration) {
  if (config.config.model) {
    return config.config.model;
  }

  if (Deno.env.has("GOOGLE_GENERATIVE_AI_API_KEY")) {
    return "gemini-default";
  }

  throw new Error(`Unable to infer model from the environment`);
}

export default createProvider;
