# Fay development guide

## Project Overview

This is a typescript mono repo using the deno runtime. The main entry package is
the `cli` package that has the interactive cli application

## Naming Conventions

- **PascalCase**: Component names, classes and interfaces
- **UPPER_CASE**: Constants and configuration keys
- **camelCase**: Private fields, local variables, parameters

## Commands

Before submitting any changes, it is crucial to validate them by running the
full preflight check. This command will build the repository, run all tests,
check for type errors, and lint the code.

To run the full suite of checks, execute the following command:

```
deno task 'preflight:*'
```

Other useful commands are:

- `deno fmt .` Fix all the formatting of the code.

## Workflow

We are using sapling scm here are the commands you can use.

- Get the current stack
  `sl log -r 'bottom::top' -T'node({node});title({desc|firstline});pr({github_pull_request_number})'`
- Commit changes `sl commit -Am <message> -I <file> -I <file>`
- Amend a commit, files and message are complementary
  `sl amend -A --to <commit> -m <message> -I <file> -I <file>`
- Submit your changes `sl pr submit`
- Update the stack `sl pull --rebase`

One pr must only contain one commit. PRs can be stacked in a continuous stream
of work. Where possible logical changes should be put into one commit.

After you have completed a task you may submit your changes for review.

## Committing

All commit messages should follow the conventional format for the title starting
with a lower case char, then there is a "Summary" and a "Test Plan". For
example:

```txt
<Type>: <Title>

Summary:

<Summary>

Test Plan:

<TestPlan>
```

The "Title" should be a short description of the change. The "Summary" is a more
detailed expanded description. The "TestPlan" is a description of how we are
going it test this change.

- All commits should be small and focused on one thing
- The commit title should not start with an uppercase letter or the type
- Each section should be followed by a empty line

### Types

Commit types are hard coded and cannot be changed. The following commit types
must be used. The ensures changelogs and semantic visioning can be used
correctly.

- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **improvement**: A improvement to an existing feature
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **revert**: For when your reverting commits with
  [git](https://git-scm.com/docs/git-revert)
- **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, etc)
- **test**: Adding missing tests or correcting existing tests
