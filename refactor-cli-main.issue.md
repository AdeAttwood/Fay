---
name: "🚀 Feature request"
about: Suggest an idea for this project
labels: 'enhancement'
---

## Problem to solve

The `cli/main.ts` file currently contains all the logic for printing to the
console. This makes the file large and difficult to maintain.

## Proposal

Refactor the printing logic out of `cli/main.ts` and into a separate module.
This will improve the separation of concerns and make the code easier to read
and test.

## Further details

The new module could be called `cli/printer.ts` and could export functions for
printing different types of output, such as messages, errors, and lists.

## Links / References

N/A
