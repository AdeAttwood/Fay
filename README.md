# Fay

Fay is an interactive CLI tool that helps users with software engineering tasks.

## Features

- Interactive command line interface - Uses an AI agent to assist with tasks
- Agent tools to help along the way

## Installation

### Building from source

The project is built using the [deno](https://deno.com/) runtime. You can
compile the binary, you can run the following command

```bash
deno task compile:cli
```

You will then get `bin/fay` or `bin/fay.exe` on windows

## Model Setup

Fay uses the Gemini family of models from Google. To use these models, you will
need to set the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable.

```bash
export GOOGLE_GENERATIVE_AI_API_KEY=<your_api_key>
```

To run the interactive agent

```bash
./bin/fay
```

## Configuration

Fay can be configured on a global, and on a per-project bases. The configuration
is a JSON file that can be in the following locations, in order of precedence:

- `FAY_CONFIG` environment variable
- `.git/fay/fay.json` - `.fay.json`
- `APPDATA/fay/fay.json` (windows only)
- `HOME/.config/fay/fay.json`
- `HOME/.fay.json`

### model

The name of the model to use for the agent. A list of models can be found in
`agent/provider.ts`.

```json
{
  "model": "gemini-1.5-flash-latest"
}
```

### contextFiles

Context files for the agent. These are files that provide additional context to
the agent, they are usually project specific. The default value is
`["AGENTS.md"]`, this will find it in the root of the agent context.

```json
{
  "contextFiles": [
    "AGENTS.md"
  ]
}
```

## Usage

Before starting Fay, you will need to create a new session.

> [!IMPORTANT]
>  At the moment fay must be run from the root of a git repo.

```sh
fay new --title "My session title"
```

All of your sessions can be listed like.

```
fay list
```

You can run fay and take the initial prompt from a file. This will be as if you
typed this into the first prompt. If the agent requires input after, you will
get the interactive prompt.

```sh
fay run --prompt-file ./prompt.md
```

## Slash Commands

Slash commands can be used to perform actions that don't need the agent input.
They can be typed into the interactive input.

| Command   | Description                                                |
| :-------- | :--------------------------------------------------------- |
| `/open`   | Opens the default editor (`$EDITOR`) for multi-line input. |
| `/system` | Displays the current system prompt.                        |
