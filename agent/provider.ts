import { google } from "@ai-sdk/google";

export function createProvider(modelName: string) {
  switch (modelName) {
    case "gemini-default":
      return google("gemini-2.0-flash");

    case "gemini-2.5-pro":
    case "gemini-2.0-flash":
      return google(modelName);

    default:
      throw new Error(`Unable to infer model '${modelName}'`);
  }
}

export function inferProviderFromEnvironment() {
  if (Deno.env.has("GOOGLE_GENERATIVE_AI_API_KEY")) {
    return createProvider("gemini-default");
  }

  throw new Error(`Unable to infer model from the environment`);
}

export default createProvider;
