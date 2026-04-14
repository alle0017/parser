# parser

A compact TypeScript parser framework and educational playground for
tokenization, parsing, lookahead analysis, and AST construction. The
codebase is organized so you can experiment with parser components and
run small demos to validate behavior.

**Highlights**
- Small, modular parser components (tokenizer, reducer, parser)
- Lookahead analysis utilities to inspect upcoming tokens
- AST types, converters and traversal helpers
- Visualizer that converts, with different granularity, the instruction or basic blocks to valid [mermaid code](https://mermaid.js.org/)
- Focused demos under `demos/` for quick exploration

**Requirements**
- Deno (recommended for running the demos as provided)

Quick start
-
Run a demo with Deno (examples):

```bash
deno run demos/struct.ts
deno run demos/if_basic_blocks.ts
deno run demos/grammar.ts
```

Project layout
-
- `main.ts` — simple entry point for quick experiments
- `demos/` — runnable examples demonstrating parser usage
- `src/` — core TypeScript modules (AST, traversal, utilities)
- `src/ast` — AST node definitions, converters, and helpers
- `parser/` — tokenizer, parser, reducer, and lookahead analyzer
- `exceptions/` — custom parser exception classes

Usage notes
-
- Use the demos to verify parser behavior after changes.
- The code is written to run with Deno-style imports; to run under Node.js,
  adjust imports and toolchain (e.g., compile with `tsc` or use `ts-node`).

Development
-
- Modify source files under `src/` and `parser/` and exercise changes
  via the demos. Keep the demos minimal and self-contained so they
  clearly demonstrate the intended parsing behavior.

Contributing
-
Contributions and bug reports are welcome. Please open an issue with a
short description and a minimal reproduction, or submit a pull request
with focused changes and updated demos where applicable.
