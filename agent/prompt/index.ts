import systemPrompt from "./system.ts";
import type { Configuration } from "../config.ts";

export function buildSystemPrompt(config: Configuration) {
  let prompt = systemPrompt;

  const contextFile = config.contextFiles();
  for (const file of contextFile) {
    try {
      prompt += `\n--- Context from: ${file} ---\n` +
        Deno.readTextFileSync(file) + `\n--- End context from: ${file} ---`;
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  return prompt;
}
