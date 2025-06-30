# Fay

Fay is an interactive CLI tool that helps users with software engineering tasks.

## Features

- Interactive command line interface
- Uses an AI agent to assist with tasks

## Model Setup

Fay uses the Gemini family of models from Google. To use these models, you will
need to set the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable.

```bash
export GOOGLE_GENERATIVE_AI_API_KEY=<your_api_key>
```

## Building

To build the project:

```bash
deno task compile:cli
```

To run the interactive agent

```bash
./bin/fay
```

## Configuration

Fay can be configured on a global, and on a per project bases. The configuration
is a json file that can be in the following locations, in order of precedence:

- `FAY_CONFIG` environment variable
- `.git/fay/fay.json`
- `.fay.json`
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
