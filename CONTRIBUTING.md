# Contributing

## Scope

This project is currently focused on one validated path:

`visual UI action -> structured intent / manual change request -> copy for AI`

Please keep new proposals aligned with that direction unless the roadmap explicitly expands the scope.

## Before opening a pull request

1. Read [README.md](./README.md) and [ROADMAP.md](./ROADMAP.md).
2. Open an issue first for large feature work or architecture changes.
3. Keep changes focused. Avoid mixing unrelated refactors with feature work.

## Development setup

```bash
pnpm install
pnpm dev:demo
pnpm dev:extension
```

Useful verification commands:

```bash
pnpm typecheck
pnpm build
```

## Contribution guidelines

- Prefer strong typing and explicit exports.
- Keep package boundaries clear.
- Avoid adding heavy dependencies unless there is a concrete product need.
- Preserve the current product boundary: visual preview first, source-code patching later.
- When changing overlay behavior, verify the full flow manually:
  - enable debug
  - select target
  - position / size / describe
  - copy for AI

## Pull request expectations

Each pull request should include:

- a clear summary of what changed
- verification steps
- screenshots or GIFs if UI behavior changed
- notes about tradeoffs or known limitations

Use the repository PR template when possible.

## Media files

Demo videos under `docs/media/` are tracked with Git LFS. If you add or update media, keep file names stable when possible so README links do not break.
