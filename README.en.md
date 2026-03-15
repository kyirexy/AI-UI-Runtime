# AI UI Runtime

An open-source browser extension MVP that validates this workflow:

`real page interaction -> structured UI Intent / manual change request -> copy for AI`

The current version does not modify source code directly and does not integrate with Claude, Codex, Cursor, or MCP yet. It focuses on the upstream problem: turning real UI interaction into higher-quality AI context.

[中文说明](./README.md)  
[Roadmap](./ROADMAP.md)  
[Contributing](./CONTRIBUTING.md)  
[Security Policy](./SECURITY.md)

## Demo

- Demo video: [`docs/media/ai-ui-runtime-demo.mp4`](./docs/media/ai-ui-runtime-demo.mp4)
- Media notes: [`docs/media/README.md`](./docs/media/README.md)

The repository uses Git LFS for the demo video. If you want the media assets after cloning:

```bash
git lfs install
git lfs pull
```

## What problem this project solves

Sending a screenshot to AI is usually too weak:

- AI cannot reliably tell which real component should change.
- AI cannot easily decide whether the fix belongs on the current node, its parent container, or a higher layout wrapper.

AI UI Runtime captures richer runtime context before AI is involved:

- select the target component
- preview a move or resize action
- or type a change request directly
- copy a stronger AI prompt with locator and hierarchy hints

## Core capabilities

- Chrome Extension Manifest V3
- silent by default until debug is explicitly enabled on the current page
- in-page overlay control panel
- `Position` mode for selection and move preview, including grouped multi-select move
- `Size` mode for resize preview through the visible overlay edges and corner handles
- `Describe` mode for selecting a target and typing a request
- structured intent output
- AI-ready prompt output
- Chinese and English UI

## Current boundaries

- no automatic source-code editing
- no direct send-to-Claude / Codex / Cursor
- no patch apply
- no IDE plugin
- no persistent layout rewrite

Move and resize are visual previews for now. The goal is to validate “better AI input”, not to permanently rewrite the webpage.

## Why it is more useful than a normal prompt

The copied AI context includes more than tag / class:

- selector hint
- DOM path
- parent container signature
- semantic path
- ancestor trail
- closest heading
- landmark container
- sibling position
- child count
- common test and `data-*` attributes

These clues help AI find the real layout boundary in source code instead of blindly editing a runtime node.

## Demo flows

### Flow A: Position

1. Enable debug
2. Select a card or container
3. Drag it in `Position`
4. Click `Copy for AI`

### Flow B: Size

1. Enable debug
2. Select an information panel
3. Switch to `Size`
4. Drag an edge or corner of the visible selection frame
5. Click `Copy for AI`

### Flow C: Describe

1. Enable debug
2. Switch to `Describe`
3. Select a target
4. Type the requested change
5. Click `Copy for AI`

## Repository structure

```text
ai-ui-runtime/
├─ apps/
│  └─ demo-app/
├─ docs/
│  └─ media/
├─ packages/
│  ├─ browser-extension/
│  ├─ intent-engine/
│  ├─ shared/
│  └─ ui-runtime/
├─ CHANGELOG.md
├─ CODE_OF_CONDUCT.md
├─ CONTRIBUTING.md
├─ LICENSE
├─ README.en.md
├─ README.md
├─ ROADMAP.md
└─ SECURITY.md
```

## Package responsibilities

### `apps/demo-app`

Local surface for testing the extension against a realistic DOM structure.

### `packages/shared`

Shared types and utilities:

- `Rect`
- `UIComponent`
- `UIIntent`
- locale and helpers

### `packages/ui-runtime`

Responsible for runtime DOM discovery:

- scanning visible DOM nodes
- filtering nodes that should not be interactive
- building runtime component models

### `packages/intent-engine`

Responsible for converting visual actions into structured intent:

- `move`
- `move-group`
- `resize`

### `packages/browser-extension`

The extension itself:

- MV3 background
- popup
- content script
- overlay UI
- hover / selection / move / resize / describe

## Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the demo app

```bash
pnpm dev:demo
```

Default URL:

```text
http://localhost:5173
```

The demo is only a local validation page. The extension is not tied to `localhost`; it can run on normal `http://`, `https://`, or `file://` pages.

### 3. Build the extension

```bash
pnpm build:extension
```

Build output:

```text
packages/browser-extension/dist
```

### 4. Load the extension

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select `packages/browser-extension/dist`

## How to use

### Debug activation

The extension stays silent after installation:

- no highlight
- no pointer interception
- no page mutation

The overlay appears only after clicking `Enable Debug on This Page` in the popup.

### Three core modes

- `Position`
  Select and drag elements to preview movement. Supports grouped move.
- `Size`
  Resize a single selected element by dragging the visible overlay edges or corners.
- `Describe`
  Keep selecting targets and write the requested change in plain language.

### Copy for AI

There is one main action:

- `Copy for AI`

It combines:

- locator hints for the current target
- hierarchy clues
- the latest visual intent
- the typed request from `Describe`

## Development commands

```bash
pnpm dev
```

Starts the demo and extension watch build together.

```bash
pnpm dev:demo
```

Starts only the demo.

```bash
pnpm dev:extension
```

Starts only the extension watch build.

```bash
pnpm build
```

Builds the whole workspace.

```bash
pnpm typecheck
```

Runs TypeScript checks.

## Open-source collaboration

- Chinese README: [README.md](./README.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](./SECURITY.md)

## Known limitations

- Group move is supported, but group resize is not yet supported
- Visual previews do not persist back into the webpage
- Complex pages can still lead to overly fine-grained selections, so the extension currently uses heuristics to promote targets to more stable containers
- The current product is still “better AI input”, not an automatic patching system

## License

`MIT`
