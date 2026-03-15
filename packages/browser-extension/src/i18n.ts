import type { SupportedLocale, UIIntent } from "@ai-ui-runtime/shared";

export type CopyContextComponent = {
  id: string;
  tag: string;
  classList: string[];
  text?: string;
  selector: string;
  domPath: string;
  parentSignature?: string;
  role?: string;
  ariaLabel?: string;
  pageUrl: string;
};

export type AiPromptContext = {
  primaryComponent: CopyContextComponent;
  components: CopyContextComponent[];
  intent?: UIIntent | null;
  userPrompt?: string;
};

export type IntentCopyContext = AiPromptContext & {
  intent: UIIntent;
};

type PopupStrings = {
  title: string;
  subtitle: string;
  pageLabel: string;
  pageUnknown: string;
  statusLabel: string;
  statusActive: string;
  statusInactive: string;
  localeLabel: string;
  unsupportedPage: string;
  enableButton: string;
  disableButton: string;
  enabledHint: string;
  inactiveHint: string;
  stepsTitle: string;
  steps: string[];
  refreshButton: string;
  noActiveTab: string;
  readStateError: string;
};

type OverlayStrings = {
  eyebrow: string;
  title: string;
  enabledStatus: string;
  modeLabel: string;
  modes: {
    adjust: string;
    inspect: string;
    resize: string;
  };
  modeHelpTitle: string;
  modeGuidance: {
    adjust: string;
    inspect: string;
    resize: string;
  };
  hoverLabel: string;
  selectedTitle: string;
  selectedSummaryTitle: string;
  selectedCountLabel: string;
  emptySelection: string;
  selectedTextLabel: string;
  multiSelectHint: string;
  fields: {
    id: string;
    tag: string;
    className: string;
    selector: string;
    domPath: string;
    parent: string;
    role: string;
    ariaLabel: string;
    pageUrl: string;
  };
  lastActionEmpty: string;
  latestIntentTitle: string;
  latestIntentEmpty: string;
  captureTitle: string;
  whatChangedTitle: string;
  quickActionsTitle: string;
  advancedTitle: string;
  advancedHint: string;
  useWithAiTitle: string;
  promptComposerTitle: string;
  promptPlaceholder: string;
  promptDisabledPlaceholder: string;
  promptHint: string;
  promptReadyHint: string;
  promptSelectionHint: string;
  clearPrompt: string;
  clearPromptSuccess: string;
  copyForAiEmptyHint: string;
  copyForAi: string;
  copyJson: string;
  copyFullContext: string;
  undoPreview: string;
  exit: string;
  dismiss: string;
  copyForAiSuccess: string;
  copyJsonSuccess: string;
  copyFullContextSuccess: string;
  copyFailure: string;
  previewResetSuccess: string;
  resetPreviewHint: string;
  aiCopyHint: string;
  controlsHint: string;
  selectBeforeResize: string;
  resizeSingleOnly: string;
  resizeFocusedPrimary: string;
  intentCaptured: string;
};

export type ExtensionStrings = {
  localeNames: Record<SupportedLocale, string>;
  popup: PopupStrings;
  overlay: OverlayStrings;
};

const strings: Record<SupportedLocale, ExtensionStrings> = {
  "zh-CN": {
    localeNames: {
      "zh-CN": "简体中文",
      "en-US": "English"
    },
    popup: {
      title: "AI UI 运行时",
      subtitle: "扩展默认静默。只有你为当前页面启用调试后，才会接管交互并提供可视化调整能力。",
      pageLabel: "当前页面",
      pageUnknown: "未知页面",
      statusLabel: "状态",
      statusActive: "调试已启用",
      statusInactive: "未启用",
      localeLabel: "语言",
      unsupportedPage: "当前页面不支持注入 overlay，请切换到普通网页、本地开发站点或 file 页面。",
      enableButton: "启用当前页调试",
      disableButton: "关闭当前页调试",
      enabledHint: "启用后 popup 会自动关闭，回到页面即可直接单击选择并拖动调整。",
      inactiveHint: "启用后默认进入“位置”模式；如果你想手写修改要求，可以切到“描述”填写。",
      stepsTitle: "使用步骤",
      steps: ["启用当前页调试", "单击元素选择", "在“位置”里拖动调整", "或切到“描述”写修改要求", "复制给 AI"],
      refreshButton: "刷新状态",
      noActiveTab: "没有找到当前激活的标签页。",
      readStateError: "读取当前页面状态失败。"
    },
    overlay: {
      eyebrow: "浏览器调试运行时",
      title: "AI UI 运行时",
      enabledStatus: "当前页调试已启用",
      modeLabel: "模式",
      modes: {
        adjust: "位置",
        inspect: "描述",
        resize: "尺寸"
      },
      modeHelpTitle: "当前模式说明",
      modeGuidance: {
        adjust: "位置模式用于调整摆放。直接单击元素即可选中，拖动已选中元素即可移动；按住 Ctrl / Cmd 再单击可以多选后整体移动。",
        inspect: "描述模式用于选中目标并写修改要求。这个模式下仍然可以继续单击页面元素切换目标，然后把你的需求发给 AI。",
        resize: "尺寸模式只支持单选。拖动边缘或角点做尺寸预览。"
      },
      hoverLabel: "悬停目标",
      selectedTitle: "技术定位信息",
      selectedSummaryTitle: "当前目标",
      selectedCountLabel: "选中数量",
      emptySelection: "直接在页面上单击一个元素即可开始调整。",
      selectedTextLabel: "页面文本",
      multiSelectHint: "提示：调整模式下支持 Ctrl / Cmd + 单击多选；拖动任意已选元素都会带动整组一起移动。",
      fields: {
        id: "运行时 ID",
        tag: "标签",
        className: "类名",
        selector: "选择器线索",
        domPath: "DOM 路径",
        parent: "父级容器",
        role: "Role",
        ariaLabel: "Aria Label",
        pageUrl: "页面 URL"
      },
      lastActionEmpty: "还没有捕获到操作。",
      latestIntentTitle: "结构化 Intent",
      latestIntentEmpty: "还没有生成 Intent JSON。",
      captureTitle: "已捕获 UI 意图",
      whatChangedTitle: "发生了什么变化",
      quickActionsTitle: "常用操作",
      advancedTitle: "高级信息",
      advancedHint: "JSON、定位线索与完整上下文",
      useWithAiTitle: "其他导出格式",
      promptComposerTitle: "手动修改要求",
      promptPlaceholder: "例如：让这个卡片更紧凑一点，标题字号小 2px，按钮改成描边主色风格，整体左对齐。",
      promptDisabledPlaceholder: "先选中一个元素，再在这里写你希望 AI 如何修改它。",
      promptHint: "这段文字会和当前选中的元素定位信息一起进入主提示词。",
      promptReadyHint: "已写入这次文字修改要求。",
      promptSelectionHint: "复制给 AI 时，会优先把这段要求绑定到当前选中的目标上。",
      clearPrompt: "清空输入",
      clearPromptSuccess: "已清空手动修改要求。",
      copyForAiEmptyHint: "先选中目标，然后要么做一次拖拽或缩放预览，要么在“查看”里写下你的修改要求。",
      copyForAi: "复制给 AI",
      copyJson: "复制 JSON",
      copyFullContext: "复制完整上下文",
      undoPreview: "撤销这次预览",
      exit: "退出调试",
      dismiss: "收起",
      copyForAiSuccess: "已复制推荐给 AI 的主提示词。",
      copyJsonSuccess: "已复制 Intent JSON。",
      copyFullContextSuccess: "已复制完整上下文。",
      copyFailure: "复制失败，请检查当前页面的剪贴板权限。",
      previewResetSuccess: "已撤销最近一次视觉预览。",
      resetPreviewHint: "撤销只会恢复最近一次 move / resize 的临时预览，不会关闭调试。",
      aiCopyHint: "“复制给 AI”会自动带上定位线索、最近一次视觉操作，以及你手写的修改要求。",
      controlsHint: "控制台 + 面板",
      selectBeforeResize: "需要先选中一个元素，才能进入“尺寸”。",
      resizeSingleOnly: "尺寸模式只支持单选。",
      resizeFocusedPrimary: "已自动聚焦最后选中的元素，并切换到“尺寸”。",
      intentCaptured: "操作完成，Intent 已生成。"
    }
  },
  "en-US": {
    localeNames: {
      "zh-CN": "简体中文",
      "en-US": "English"
    },
    popup: {
      title: "AI UI Runtime",
      subtitle: "The extension stays silent by default. It only takes over interactions after you enable debug on the current page.",
      pageLabel: "Current page",
      pageUnknown: "Unknown page",
      statusLabel: "Status",
      statusActive: "Debug enabled",
      statusInactive: "Inactive",
      localeLabel: "Language",
      unsupportedPage: "This page does not support overlay injection. Open a normal webpage, local dev site, or file page.",
      enableButton: "Enable Debug on This Page",
      disableButton: "Disable Debug on This Page",
      enabledHint: "The popup closes automatically after enabling. Go back to the page and you can click to select and drag immediately.",
      inactiveHint: "After enabling, the overlay starts in Position mode. Switch to Describe when you want to type a manual change request.",
      stepsTitle: "How to use",
      steps: ["Enable debug", "Click to select", "Drag in Position mode", "Or switch to Describe and type a request", "Copy for AI"],
      refreshButton: "Refresh Status",
      noActiveTab: "No active tab found.",
      readStateError: "Unable to read the current page state."
    },
    overlay: {
      eyebrow: "Browser Debug Runtime",
      title: "AI UI Runtime",
      enabledStatus: "Debug is enabled on this page",
      modeLabel: "Mode",
      modes: {
        adjust: "Position",
        inspect: "Describe",
        resize: "Size"
      },
      modeHelpTitle: "Mode guidance",
      modeGuidance: {
        adjust: "Position mode is for placement changes. Click to select, then drag the selected element to move it. Hold Ctrl / Cmd while clicking to build a multi-select move group.",
        inspect: "Describe mode is for selecting the target and typing your own change request. You can still click page elements here to switch the current target before copying for AI.",
        resize: "Size mode supports a single selected element. Drag an edge or corner handle to preview size changes."
      },
      hoverLabel: "Hover target",
      selectedTitle: "Technical locator details",
      selectedSummaryTitle: "Current target",
      selectedCountLabel: "Selected count",
      emptySelection: "Click any page element to start adjusting.",
      selectedTextLabel: "Visible text",
      multiSelectHint: "Tip: in Adjust mode, Ctrl / Cmd + click adds multiple elements. Drag any selected element to move the whole group.",
      fields: {
        id: "Runtime ID",
        tag: "Tag",
        className: "Class",
        selector: "Selector hint",
        domPath: "DOM path",
        parent: "Parent container",
        role: "Role",
        ariaLabel: "Aria Label",
        pageUrl: "Page URL"
      },
      lastActionEmpty: "No action captured yet.",
      latestIntentTitle: "Structured Intent",
      latestIntentEmpty: "No intent JSON generated yet.",
      captureTitle: "UI Intent Captured",
      whatChangedTitle: "What changed",
      quickActionsTitle: "Quick actions",
      advancedTitle: "Advanced details",
      advancedHint: "JSON, locator hints, and full context",
      useWithAiTitle: "Other export formats",
      promptComposerTitle: "Manual change request",
      promptPlaceholder: "Example: Make this card more compact, reduce the title size by 2px, switch the button to an outlined primary style, and align the content to the left.",
      promptDisabledPlaceholder: "Select an element first, then describe how you want AI to change it.",
      promptHint: "This text will be combined with the current target locator hints in the main AI prompt.",
      promptReadyHint: "Manual request is ready.",
      promptSelectionHint: "When you copy for AI, this request is attached to the currently selected target.",
      clearPrompt: "Clear text",
      clearPromptSuccess: "Cleared the manual change request.",
      copyForAiEmptyHint: "Select a target first, then either capture a move / resize preview or type your own change request in Inspect.",
      copyForAi: "Copy for AI",
      copyJson: "Copy JSON",
      copyFullContext: "Copy Full Context",
      undoPreview: "Undo This Preview",
      exit: "Exit Debug",
      dismiss: "Dismiss",
      copyForAiSuccess: "Copied the recommended AI prompt.",
      copyJsonSuccess: "Intent JSON copied.",
      copyFullContextSuccess: "Full context copied.",
      copyFailure: "Copy failed. Check clipboard permissions on this page.",
      previewResetSuccess: "The latest visual preview was reverted.",
      resetPreviewHint: "Undo restores only the latest move / resize preview without leaving debug mode.",
      aiCopyHint: "Copy for AI includes locator hints, the latest visual action, and your typed change request when available.",
      controlsHint: "console + panel",
      selectBeforeResize: "Select one element before entering Size.",
      resizeSingleOnly: "Size mode supports only one selected element.",
      resizeFocusedPrimary: "Focused the last selected element and switched to Size.",
      intentCaptured: "The action finished and the intent is ready."
    }
  }
};

function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatClassList(classList: string[], locale: SupportedLocale): string {
  if (classList.length === 0) {
    return locale === "zh-CN" ? "无" : "(none)";
  }

  return classList.join(" ");
}

function formatSize(width: number, height: number): string {
  return `${width}px x ${height}px`;
}

function formatOptionalLine(label: string, value: string | undefined): string | null {
  return value ? `${label}: ${value}` : null;
}

function formatTargetLine(component: CopyContextComponent, locale: SupportedLocale): string {
  const summary = component.text
    ? `${formatElementSignature(component.tag, component.classList)} | "${component.text}"`
    : formatElementSignature(component.tag, component.classList);

  if (locale === "zh-CN") {
    return `${summary} | selector=${component.selector} | parent=${component.parentSignature ?? "无"}`;
  }

  return `${summary} | selector=${component.selector} | parent=${component.parentSignature ?? "(none)"}`;
}

function formatLocatorBlock(component: CopyContextComponent, locale: SupportedLocale): string[] {
  return [
    `pageUrl: ${component.pageUrl}`,
    `runtimeComponentId: ${component.id}`,
    `tag: ${component.tag}`,
    `class: ${formatClassList(component.classList, locale)}`,
    `selectorHint: ${component.selector}`,
    `domPathHint: ${component.domPath}`,
    formatOptionalLine("parentContainer", component.parentSignature),
    formatOptionalLine("visibleText", component.text),
    formatOptionalLine("role", component.role),
    formatOptionalLine("ariaLabel", component.ariaLabel)
  ].filter(Boolean) as string[];
}

function buildActionGuidance(locale: SupportedLocale, intent?: UIIntent | null): string {
  if (!intent) {
    return locale === "zh-CN"
      ? "优先做可维护的样式或布局修改，避免只写一次性的行内覆盖或脆弱 hack。"
      : "Prefer maintainable style or layout changes instead of one-off inline overrides or brittle hacks.";
  }

  if (intent.action === "resize") {
    return locale === "zh-CN"
      ? "优先使用容器尺寸约束、flex-basis、grid tracks 或布局参数调整尺寸，避免写死宽高。"
      : "Prefer container sizing constraints, flex-basis, grid tracks, or layout parameters for resizing instead of hard-coded width and height.";
  }

  return locale === "zh-CN"
    ? "优先使用 flex / grid / spacing / alignment 调整位置，避免 absolute positioning hack。"
    : "Prefer flex / grid / spacing / alignment changes for movement instead of absolute-positioning hacks.";
}

function buildSourceGuidance(locale: SupportedLocale, component: CopyContextComponent): string {
  const textLikeTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "button"]);

  if (textLikeTags.has(component.tag)) {
    return locale === "zh-CN"
      ? "如果目标是文本或按钮，优先检查控制它位置或尺寸的父级布局容器，而不是只改文本节点本身。"
      : "If the target is text or a button, inspect the parent layout container first instead of editing only the text node.";
  }

  return locale === "zh-CN"
    ? "优先确认真正控制这个元素布局的组件或容器，而不是只改最内层节点。"
    : "Confirm the component or container that actually controls the layout before editing the innermost node.";
}

function buildVisualChangeBlock(locale: SupportedLocale, context: AiPromptContext): string[] {
  if (!context.intent) {
    return locale === "zh-CN"
      ? ["本次没有捕获到拖拽或缩放预览，请主要依据下面的文字修改要求执行。"]
      : ["No move or resize preview was captured. Use the manual change request below as the primary instruction."];
  }

  return [
    describeIntent(locale, context.intent),
    context.intent.action === "move-group"
      ? `groupMembers: ${JSON.stringify(context.intent.members, null, 2)}`
      : `beforeRect: ${JSON.stringify(context.intent.before)}\nafterRect: ${JSON.stringify(context.intent.after)}`
  ];
}

export function formatElementSignature(tag: string, classList: string[]): string {
  const classes = classList.filter(Boolean).slice(0, 2);
  if (classes.length === 0) {
    return tag;
  }

  return `${tag}.${classes.join(".")}`;
}

export function getExtensionStrings(locale: SupportedLocale): ExtensionStrings {
  return strings[locale];
}

export function describeIntent(locale: SupportedLocale, intent: UIIntent): string {
  if (intent.action === "move") {
    if (locale === "zh-CN") {
      return `移动 ${intent.componentId}，X ${formatSigned(intent.deltaX)}px，Y ${formatSigned(intent.deltaY)}px`;
    }

    return `Move ${intent.componentId} by X ${formatSigned(intent.deltaX)}px and Y ${formatSigned(intent.deltaY)}px`;
  }

  if (intent.action === "move-group") {
    if (locale === "zh-CN") {
      return `整体移动 ${intent.componentIds.length} 个元素，X ${formatSigned(intent.deltaX)}px，Y ${formatSigned(intent.deltaY)}px`;
    }

    return `Move ${intent.componentIds.length} selected elements by X ${formatSigned(intent.deltaX)}px and Y ${formatSigned(intent.deltaY)}px`;
  }

  if (locale === "zh-CN") {
    return `缩放 ${intent.componentId}，宽 ${formatSigned(intent.deltaWidth)}px，高 ${formatSigned(intent.deltaHeight)}px`;
  }

  return `Resize ${intent.componentId} by width ${formatSigned(intent.deltaWidth)}px and height ${formatSigned(intent.deltaHeight)}px`;
}

export function buildWhatChanged(locale: SupportedLocale, context: IntentCopyContext): string {
  const { components, intent, primaryComponent } = context;

  if (intent.action === "move-group") {
    const targets = components.slice(0, 4).map((component) => `- ${formatTargetLine(component, locale)}`);
    const moreCount = Math.max(0, components.length - targets.length);

    return [
      locale === "zh-CN" ? `- 本次整体移动了 ${components.length} 个元素` : `- Moved ${components.length} selected elements together`,
      locale === "zh-CN"
        ? `- 水平移动：${formatSigned(intent.deltaX)}px`
        : `- Horizontal move: ${formatSigned(intent.deltaX)}px`,
      locale === "zh-CN"
        ? `- 垂直移动：${formatSigned(intent.deltaY)}px`
        : `- Vertical move: ${formatSigned(intent.deltaY)}px`,
      ...targets,
      moreCount > 0
        ? locale === "zh-CN"
          ? `- 还有 ${moreCount} 个元素未展开`
          : `- ${moreCount} more selected elements omitted`
        : null
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (intent.action === "move") {
    if (locale === "zh-CN") {
      return [
        `- 目标：${formatTargetLine(primaryComponent, locale)}`,
        `- 水平移动：${formatSigned(intent.deltaX)}px`,
        `- 垂直移动：${formatSigned(intent.deltaY)}px`,
        `- 调整前：(${intent.before.x}, ${intent.before.y})`,
        `- 调整后：(${intent.after.x}, ${intent.after.y})`
      ].join("\n");
    }

    return [
      `- Target: ${formatTargetLine(primaryComponent, locale)}`,
      `- Horizontal move: ${formatSigned(intent.deltaX)}px`,
      `- Vertical move: ${formatSigned(intent.deltaY)}px`,
      `- Before: (${intent.before.x}, ${intent.before.y})`,
      `- After: (${intent.after.x}, ${intent.after.y})`
    ].join("\n");
  }

  if (locale === "zh-CN") {
    return [
      `- 目标：${formatTargetLine(primaryComponent, locale)}`,
      `- 宽度变化：${formatSigned(intent.deltaWidth)}px`,
      `- 高度变化：${formatSigned(intent.deltaHeight)}px`,
      `- 调整前：${formatSize(intent.before.width, intent.before.height)}`,
      `- 调整后：${formatSize(intent.after.width, intent.after.height)}`
    ].join("\n");
  }

  return [
    `- Target: ${formatTargetLine(primaryComponent, locale)}`,
    `- Width delta: ${formatSigned(intent.deltaWidth)}px`,
    `- Height delta: ${formatSigned(intent.deltaHeight)}px`,
    `- Before: ${formatSize(intent.before.width, intent.before.height)}`,
    `- After: ${formatSize(intent.after.width, intent.after.height)}`
  ].join("\n");
}

export function buildAiPrompt(locale: SupportedLocale, context: AiPromptContext): string {
  const targetLines = context.components.map((component, index) => `${index + 1}. ${formatTargetLine(component, locale)}`);
  const primaryLocatorLines = formatLocatorBlock(context.primaryComponent, locale);
  const userPrompt = context.userPrompt?.trim();
  const sourceGuidance = buildSourceGuidance(locale, context.primaryComponent);
  const actionGuidance = buildActionGuidance(locale, context.intent);
  const visualChangeBlock = buildVisualChangeBlock(locale, context);
  const intentText = context.intent ? JSON.stringify(context.intent, null, 2) : locale === "zh-CN" ? "(无)" : "(none)";
  const userPromptBlock = userPrompt
    ? locale === "zh-CN"
      ? ["用户明确要求：", userPrompt]
      : ["Explicit user request:", userPrompt]
    : locale === "zh-CN"
      ? ["用户明确要求：", "(未填写，主要依据视觉预览执行)"]
      : ["Explicit user request:", "(not provided, use the visual preview as the primary instruction)"];

  if (locale === "zh-CN") {
    return [
      "请根据下面的页面定位线索，把这次 UI 修改准确应用到源代码里。",
      "",
      "页面与主目标定位线索：",
      ...primaryLocatorLines,
      "",
      "本次选中的目标：",
      ...targetLines,
      "",
      ...userPromptBlock,
      "",
      "视觉变化：",
      ...visualChangeBlock,
      "",
      "Structured intent:",
      intentText,
      "",
      "实现要求：",
      "1. 先根据页面 URL、可见文本、DOM 路径、父级容器关系定位真实源码位置。",
      "2. runtimeComponentId 只是运行时临时标识，不能单独当作源码组件名。",
      `3. ${sourceGuidance}`,
      `4. ${actionGuidance}`,
      userPrompt
        ? "5. 如果用户文字要求与视觉预览有冲突，以用户这次手写的修改要求为准，并说明你的取舍。"
        : "5. 如果有视觉预览，就把它当作本次修改的直接目标。",
      context.intent?.action === "move-group"
        ? "6. 如果是多选整体移动，尽量在共同父级容器或布局层处理，而不是分别打很多脆弱补丁。"
        : "6. 修改时优先输出可维护的布局或样式方案，而不是临时 hack。",
      "7. 输出时先说明你锁定了哪个源码位置，再给出修改方案或 patch。"
    ].join("\n");
  }

  return [
    "Use the locator hints below to accurately apply this UI change in the source code.",
    "",
    "Primary locator hints:",
    ...primaryLocatorLines,
    "",
    "Selected targets:",
    ...targetLines,
    "",
    ...userPromptBlock,
    "",
    "Visual change:",
    ...visualChangeBlock,
    "",
    "Structured intent:",
    intentText,
    "",
    "Implementation requirements:",
    "1. Use the page URL, visible text, DOM path, and parent container hints to find the real source location.",
    "2. The runtimeComponentId is temporary and must not be treated as the source component name.",
    `3. ${sourceGuidance}`,
    `4. ${actionGuidance}`,
    userPrompt
      ? "5. If the typed user request conflicts with the visual preview, follow the typed request and explain the tradeoff."
      : "5. If a visual preview exists, treat it as the direct target for the implementation.",
    context.intent?.action === "move-group"
      ? "6. If this is a group move, prefer handling it at the shared parent layout or container level."
      : "6. Prefer a maintainable layout or styling solution instead of a temporary hack.",
    "7. First explain which source location you matched, then provide the code change or patch."
  ].join("\n");
}

export function buildFullContext(locale: SupportedLocale, context: AiPromptContext): string {
  const primaryLines = formatLocatorBlock(context.primaryComponent, locale);
  const targetLines = context.components.map((component, index) => `${index + 1}. ${formatTargetLine(component, locale)}`);
  const userPrompt = context.userPrompt?.trim();
  const intentText = context.intent ? JSON.stringify(context.intent, null, 2) : locale === "zh-CN" ? "(无)" : "(none)";
  const changeSummary = context.intent
    ? describeIntent(locale, context.intent)
    : locale === "zh-CN"
      ? "本次没有视觉预览，主要依赖手动输入的修改要求。"
      : "No visual preview was captured. The manual request is the primary instruction.";

  if (locale === "zh-CN") {
    return [
      "主目标完整上下文：",
      ...primaryLines,
      "",
      "本次选中目标：",
      ...targetLines,
      "",
      "用户手动要求：",
      userPrompt ?? "(未填写)",
      "",
      "变化摘要：",
      changeSummary,
      "",
      "intent:",
      intentText
    ].join("\n");
  }

  return [
    "Primary target context:",
    ...primaryLines,
    "",
    "Selected targets:",
    ...targetLines,
    "",
    "Manual user request:",
    userPrompt ?? "(not provided)",
    "",
    "Change summary:",
    changeSummary,
    "",
    "intent:",
    intentText
  ].join("\n");
}
