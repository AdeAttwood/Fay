import type { Configuration } from "../config.ts";
import { which } from "@fay/which";

import systemPrompt from "./system.md" with { type: "text" };
import { expandGlobSync } from "@std/fs/expand-glob";

export function buildSystemPrompt(config: Configuration) {
  let prompt = systemPrompt;

  prompt += getEnvironmentSection();
  prompt += getShellUsageSection();
  prompt += dotnetSection();

  if (which("sl")) {
    prompt += getSaplingSection();
  }

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

function getEnvironmentSection() {
  const envSection = [
    `# Environment`,
    ``,
    `- Your cwd is ${Deno.cwd()}`,
    `- Your os is ${Deno.build.os}`,
    `- Your arch is ${Deno.build.arch}`,
    ``,
    ``,
  ];

  return envSection.join("\n");
}

function getSaplingSection() {
  return [
    `# Sapling SCM`,
    ``,
    `Source control is managed by Sapling SCM.`,
    ``,
    `## Sapling commands`,
    ``,
    "- Get the current stack `sl log -r 'bottom::top' -T'node({node});title({desc|firstline});pr({github_pull_request_number})'`",
    "- Commit changes `sl commit -Am <message> -I <file> -I <file>`",
    "- Amend a commit, files and message are complementary `sl amend -A --to <commit> -m <message> -I <file> -I <file>`",
    "- Submit your changes `sl pr submit --draft`",
    "- Update the stack `sl pull --rebase`",
    "- Show the diff of a commit `sl show <node>`",
    "- Show the current status `sl status`",
    "- Show the current changes `sl diff` NOTE: this will not show newly create files files",
    ``,
    ``,
  ].join("\n");
}

function getShellUsageSection() {
  const section = [
    `# Shell Usage`,
    ``,
    `You can use the shell tool to run commands in the shell.`,
    ``,
  ];

  function pushCommand(command: string, description: string) {
    if (which(command)) {
      section.push(`- \`${command}\`: ${description}`);
    } else {
      section.push(`- \`${command}\`: Not available`);
    }
  }

  pushCommand("git", "Git version control system");
  pushCommand("sl", "Sapling SCM for version control");
  pushCommand("gh", "GitHub CLI for managing GitHub repositories");
  pushCommand("fd", "For finding files");
  pushCommand("rg", "For searching text in files");
  pushCommand("ls", "For listing files in a directory");
  pushCommand("mkdir", "For creating directories");
  pushCommand("cp", "For copying files and directories");
  pushCommand("mv", "For moving or renaming files and directories");

  section.push("");
  section.push("");

  return section.join("\n");
}

function dotnetSection() {
  let section: string[] = [];
  const dotnet = which("dotnet");
  if (!dotnet) {
    return "";
  }

  for (
    const entry of expandGlobSync("**/*.sln", {
      exclude: ["**/node_modules/**", "**/.git/**", "**/obj/**", "**/bin/**"],
    })
  ) {
    const projects = new Deno.Command(dotnet, {
      args: [
        "sln",
        entry.path,
        "list",
      ],
    }).outputSync();

    section = section.concat([
      `# Dotnet solution found at "${entry.path}"`,
      ``,
      `## Project list`,
      ``,
      new TextDecoder().decode(projects.stdout),
      ``,
      ``,
    ]);
  }

  if (section.length > 0) {
    const info = new Deno.Command(dotnet, { args: ["--info"] }).outputSync();
    section = [
      `## Using dotnet from "${dotnet}"`,
      ``,
      new TextDecoder().decode(info.stdout),
      ``,
      ``,
    ].concat(section);
  }

  return section.join("\n");
}
