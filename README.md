# AI UI Runtime

一个浏览器扩展 MVP，用来把真实网页上的 UI 操作变成更适合发给 AI 的上下文。

核心链路只有一条：

`启用当前页调试 -> 选中 UI -> 调整位置 / 尺寸 或输入修改要求 -> 复制给 AI`

[English README](./README.en.md)  
[路线图](./ROADMAP.md)  
[贡献指南](./CONTRIBUTING.md)

## 它能做什么

- 在任意开发网页里启用调试 overlay
- 选中真实页面元素
- 预览位置调整
- 预览尺寸调整
- 直接写“我想怎么改”
- 把定位线索、层级信息和操作 intent 一起复制给 AI

## 最快使用路径

这是唯一推荐的最快路径：

1. 打开你的本地开发页面或测试页面
2. 构建并加载扩展
3. 点击扩展 popup 中的“启用当前页调试”
4. 回到页面，选中一个 UI
5. 用 `位置` 或 `尺寸` 调整一下，或者切到 `描述` 写一句修改要求
6. 点击 `复制给 AI`

如果你只是想快速上手，不需要先启动 demo 页面。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建扩展

```bash
pnpm build:extension
```

### 3. 加载扩展

1. 打开 `chrome://extensions`
2. 开启右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择 `packages/browser-extension/dist`

### 4. 在你的网页里使用

1. 打开任意 `http://`、`https://` 或 `file://` 页面
2. 点击浏览器工具栏里的扩展图标
3. 点击“启用当前页调试”
4. 开始选择、调整并复制给 AI

### 5. demo 页面是可选的

如果你想先看一个本地演示页面，再启动：

```bash
pnpm dev:demo
```

默认地址：

```text
http://localhost:5173
```

## 视频

- B 站视频：[为什么 AI 改网页 UI 总翻车？问题其实出在这里](https://www.bilibili.com/video/BV1dvwVzXECw)

## 三个模式

- `位置`
  选中元素后直接拖动，预览位置变化。
- `尺寸`
  选中元素后直接拖 overlay 边缘或角点，预览尺寸变化。
- `描述`
  继续选中目标，并直接输入文字修改要求。

## 为什么它比普通 prompt 更有用

复制给 AI 的内容不只是 tag / class，还会尽量补更多线索：

- selector hint
- DOM path
- 父级容器
- 祖先链路
- 语义层级
- 最近标题
- 地标容器
- 同级位置
- 子节点数量
- 常见 `data-*` / test 属性

目标不是让 AI 改运行时节点，而是帮助它定位真实源码里应该改哪一层布局。

## 当前边界

- 不自动改源代码
- 不自动发给 Claude / Codex / Cursor
- 不做 patch apply
- 不做 IDE 插件

当前产品的定位仍然是：`更好的 AI 输入`，不是 `自动改代码系统`。

## 常用命令

```bash
pnpm dev
```

同时启动 demo 和扩展 watch。

```bash
pnpm dev:extension
```

只启动扩展 watch。

```bash
pnpm dev:demo
```

只启动 demo，可选。

```bash
pnpm typecheck
pnpm build
```

做类型检查和完整构建。

## 仓库结构

```text
apps/demo-app               可选 demo 页面
packages/browser-extension  Chrome 扩展
packages/intent-engine      结构化 intent
packages/shared             共享类型与工具
packages/ui-runtime         DOM 扫描与运行时模型
```

## 项目状态

当前仓库已经具备可用的 MVP 形态：

- 本地 `pnpm typecheck` 可通过
- 本地 `pnpm build` 可通过
- 扩展可手动加载
- `位置 / 尺寸 / 描述 / 复制给 AI` 主路径已经可用

## License

`MIT`
