# Fay

Fay is an interactive CLI tool that helps users with software engineering tasks.

## Features

- Interactive command line interface
- Uses an AI agent to assist with tasks

## Model Setup

Fay uses the Gemini family of models from Google. To use these models, you will need to set the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable.

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
./bin/agent
```
