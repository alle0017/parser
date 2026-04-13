# parser

Purpose
-
This repository provides a small TypeScript-based parser framework and utilities for experimenting with tokenization, parsing, lookahead analysis, and AST construction. It's intended as an educational and experimental codebase for building and testing parser components (tokenizer, reducer, parser, AST traversals) and running small parser demos.

General description
-
- Language: TypeScript (designed to run with Deno in examples; can be adapted to other runtimes).
- Structure: core parser logic lives under `src/` and `parser/`. Demos are in the `demos/` folder and showcase usage patterns.
- Features:
  - Tokenization and tokenizer utilities
  - Parser and reducer modules
  - Lookahead/analyzer utilities to inspect upcoming tokens
  - AST node definitions and traversal/conversion helpers
  - Custom exception types for parser error handling

Project layout (important files)
-
- `main.ts` — simple entrypoint for running or testing the project.
- `demos/` — small runnable examples (e.g. `demos/struct.ts`, `demos/if_basic_blocks.ts`).
- `src/` — core TypeScript modules used by the parser (AST, traversal, utilities).
- `parser/` — parser definitions, tokenizer, reducer, and lookahead analyzer.
- `exceptions/` — parser-specific error classes and helpers.

Getting started
-
Requirements:
- Deno (recommended for running demos as provided).

Run a demo (example):

```bash
deno run demos/struct.ts
```

You can also run other demo files in `demos/` similarly, for example:

```bash
deno run demos/if_basic_blocks.ts
```

Development notes
-
- The codebase is modular: `src/ast` contains AST node types and converters; `parser/` contains parsing and tokenization logic. Use the demos as quick integration checks when making changes.
- If adapting to Node.js, compile or run TypeScript with an appropriate toolchain (tsc + node or ts-node), and adjust any Deno-specific imports.

Contributing
-
Contributions, improvements, and bug reports are welcome. Please open issues describing the change and include a minimal reproduction/demo where applicable.