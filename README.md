# AI UI Runtime

一个面向浏览器扩展的开源 MVP，用来验证这条链路：

`真实网页交互 -> 结构化 UI Intent / 手动修改要求 -> 复制给 AI`

当前版本不直接修改源码，也不接入 Claude、Codex、Cursor 或 MCP。它解决的是更前面的一步：让用户在真实网页上选中 UI、做视觉调整，或者直接写一段修改要求，然后把足够准确的上下文复制给 AI。

## 项目目标

这个项目想验证两种对 AI 更有价值的输入方式：

1. 视觉操作
   页面上直接移动位置、调整尺寸，系统记录前后变化并输出结构化 intent。
2. 手动描述
   选中某个 UI 后直接输入“我要怎么改”，系统把目标定位线索和文字要求一起整理成可复制给 AI 的主 prompt。

这两个输入最终会合并成一份上下文，供后续的代码代理使用。

## 当前能力

- Chrome Extension Manifest V3
- 在真实网页中启用调试 overlay
- Hover 高亮
- 单选 / 多选
- 位置调整预览
- 尺寸调整预览
- 手动输入修改要求
- 输出并复制结构化 Intent
- 输出并复制面向 AI 的主提示词
- 中英文界面

## 当前边界

当前版本刻意不做这些事情：

- 不自动改业务源码
- 不自动发消息到 Claude / Codex / Cursor
- 不做 patch apply
- 不做 IDE 插件
- 不做真实持久化布局修改

所以你现在看到的移动和缩放，都是视觉预览，不是永久写回网页布局。

## 使用方式

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动 Demo 页面

```bash
pnpm dev:demo
```

默认访问：

```text
http://localhost:5173
```

这个 demo 只是一个本地验证页。扩展本身不是 `localhost` 专用，可以工作在任意普通 `http://`、`https://` 或 `file://` 页面。

### 3. 构建扩展

```bash
pnpm build:extension
```

扩展产物目录：

```text
packages/browser-extension/dist
```

### 4. 加载扩展

1. 打开 `chrome://extensions`
2. 开启右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择 `packages/browser-extension/dist`

### 5. 在页面中使用

1. 点击浏览器工具栏里的扩展图标
2. 点击“启用当前页调试”
3. 回到页面右上角 overlay
4. 按需要切换三种模式

当前三种模式：

- `位置`
  用于调整摆放。点击页面元素即可选中，拖动即可移动。
- `尺寸`
  用于缩放单个选中元素。拖动边缘或角点做尺寸预览。
- `描述`
  用于继续选中目标，并直接输入“我想怎么改”。这段文字会和当前选中目标的定位信息一起进入主提示词。

### 6. 复制给 AI

主按钮只有一个：

- `复制给 AI`

它会根据当前状态自动组合上下文：

- 目标元素定位信息
- 最近一次视觉操作 intent
- 你在“描述”里输入的手动修改要求

如果没有做拖拽或缩放，但写了文字要求，也可以直接复制给 AI。

## 推荐验证路径

### 路径 A：视觉操作

1. 启用调试
2. 在 `位置` 模式下选中一个卡片或容器
3. 拖动它
4. 点击 `复制给 AI`

### 路径 B：文字修改

1. 启用调试
2. 切到 `描述`
3. 点击页面元素进行选中
4. 输入例如：

```text
把这个卡片改得更紧凑，标题缩小 2px，按钮改成描边主色风格，内容左对齐。
```

5. 点击 `复制给 AI`

### 路径 C：视觉 + 文字混合

1. 在 `位置` 或 `尺寸` 里做一次视觉预览
2. 切到 `描述`
3. 再补充文字要求
4. 点击 `复制给 AI`

这是当前版本最完整的一条链路。

## 开发命令

```bash
pnpm dev
```

同时启动 demo 和扩展 watch 构建。

```bash
pnpm dev:demo
```

仅启动 demo。

```bash
pnpm dev:extension
```

仅启动扩展 watch 构建。

```bash
pnpm build
```

构建整个 workspace。

```bash
pnpm build:extension
```

仅构建扩展。

```bash
pnpm typecheck
```

执行类型检查。

## 仓库结构

```text
ai-ui-runtime/
├─ apps/
│  └─ demo-app/
├─ packages/
│  ├─ browser-extension/
│  ├─ intent-engine/
│  ├─ shared/
│  └─ ui-runtime/
├─ LICENSE
├─ package.json
├─ pnpm-workspace.yaml
├─ README.md
└─ tsconfig.base.json
```

### apps/demo-app

本地验证页面，用来测试真实 DOM 交互，不包含任何业务后端逻辑。

### packages/shared

共享类型和工具：

- `Rect`
- `UIComponent`
- `UIIntent`
- 语言与通用工具

### packages/ui-runtime

负责页面扫描和目标识别：

- DOM 可见元素扫描
- 过滤不可交互节点
- 生成运行时组件信息

### packages/intent-engine

负责把视觉操作转成结构化 intent：

- `move`
- `move-group`
- `resize`

### packages/browser-extension

扩展主体：

- MV3 background
- popup
- content script
- overlay UI
- 拖拽 / 缩放 / 手动描述输入

## 开源建议

如果你准备继续把这个项目往开源方向推进，建议下一步优先做这几件事：

1. 增加截图或录屏 GIF
2. 加一个英文 README 或 README.en.md
3. 增加 issue template / pull request template
4. 增加一份 roadmap
5. 给“复制给 AI”输出补更多组件层级线索

## 已知限制

- 多选移动已经支持，但多选缩放暂不支持
- 视觉预览不会永久写回网页
- 复杂网页上仍然可能选到过细的节点，因此当前有“提升到更稳定容器”的启发式逻辑，但不是 100% 精准
- 没有自动 patch 能力，当前产物仍然是“更好的 AI 输入”

## License

本项目使用 `MIT License`。
