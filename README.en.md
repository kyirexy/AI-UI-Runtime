# AI UI Runtime

A browser extension MVP for turning real webpage UI interaction into AI-ready context.

There is one main flow:

`enable debug on the current page -> select UI -> adjust position / size or type a request -> copy for AI`

[中文说明](./README.md)  
[Roadmap](./ROADMAP.md)  
[Contributing](./CONTRIBUTING.md)

## What it does

- enable an overlay on real development pages
- select real page elements
- preview position changes
- preview size changes
- type a manual change request
- copy locator hints, hierarchy clues, and action intent for AI

## Fastest path

This is the only recommended fastest path:

1. Open your local dev page or test page
2. Build and load the extension
3. Click `Enable Debug on This Page` in the extension popup
4. Go back to the page and select one UI target
5. Use `Position` or `Size`, or switch to `Describe` and type one instruction
6. Click `Copy for AI`

You do not need to start the demo app first.

## Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build the extension

```bash
pnpm build:extension
```

### 3. Load the extension

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select `packages/browser-extension/dist`

### 4. Use it on your own page

1. Open any `http://`, `https://`, or `file://` page
2. Click the extension icon
3. Click `Enable Debug on This Page`
4. Start selecting, adjusting, and copying for AI

### 5. The demo app is optional

If you want a local example page, start it with:

```bash
pnpm dev:demo
```

Default URL:

```text
http://localhost:5173
```

## Video

- Bilibili video: [Why AI keeps failing at webpage UI edits](https://www.bilibili.com/video/BV1dvwVzXECw)

## Three modes

- `Position`
  Select and drag to preview movement.
- `Size`
  Select and drag the visible overlay edge or corner to preview resizing.
- `Describe`
  Keep the target selected and type a plain-language change request.

## Why it is more useful than a normal prompt

The copied AI context includes more than tag / class:

- selector hint
- DOM path
- parent container
- ancestor trail
- semantic path
- closest heading
- landmark container
- sibling position
- child count
- common `data-*` and test attributes

The goal is not to edit a runtime node directly. The goal is to help AI find the right layout boundary in source code.

## Current boundaries

- no automatic source-code editing
- no direct send-to-Claude / Codex / Cursor
- no patch apply
- no IDE plugin

The current product position is still: `better AI input`, not `automatic code editing`.

## Common commands

```bash
pnpm dev
```

Start the demo and extension watch mode together.

```bash
pnpm dev:extension
```

Start only the extension watch mode.

```bash
pnpm dev:demo
```

Start only the demo app. Optional.

```bash
pnpm typecheck
pnpm build
```

Run type checks and the full build.

## Repository structure

```text
apps/demo-app               optional demo page
packages/browser-extension  Chrome extension
packages/intent-engine      structured intent logic
packages/shared             shared types and utilities
packages/ui-runtime         DOM scanning and runtime modeling
```

## Project status

The repository is currently in a usable MVP state:

- local `pnpm typecheck` passes
- local `pnpm build` passes
- the extension can be loaded manually
- the main flow `Position / Size / Describe / Copy for AI` is working

## License

`MIT`
