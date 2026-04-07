import { IntentEngine } from "@ai-ui-runtime/intent-engine";
import type { Rect, SupportedLocale } from "@ai-ui-runtime/shared";
import { getElementRect } from "@ai-ui-runtime/ui-runtime";
import type { CSSProperties, JSX, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  buildAiPrompt,
  buildFullContext,
  buildWhatChanged,
  describeIntent,
  formatElementSignature,
  getExtensionStrings
} from "../i18n";
import type { AiPromptContext, CopyContextComponent, IntentCopyContext } from "../i18n";
import { bindDragBehavior, resetPreviewForElement } from "./drag";
import { applyEditingStyles, resetEditingStyles } from "./preview";
import { bindResizeBehavior } from "./resize";
import { createSelectedComponent, formatElementLabel, isOverlayEvent, resolveSelectableElement } from "./selection";
import { getActiveSelectedComponent, initialOverlayState, overlayReducer, DEFAULT_PANEL_WIDTH, DEFAULT_PANEL_HEIGHT } from "./state";
import type { OverlayMode, SelectedComponent, PanelSize } from "./state";

type OverlayAppProps = {
  locale: SupportedLocale;
  onExit: () => void;
  overlayHost: HTMLElement;
};

type FeedbackState = {
  kind: "error" | "success";
  message: string;
} | null;

type PanelPosition = {
  x: number;
  y: number;
};

type PanelDragState = {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type PanelResizeState = {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  edge: "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

const MIN_PANEL_WIDTH = 280;
const MIN_PANEL_HEIGHT = 400;

function toFrameStyle(rect: Rect): CSSProperties {
  return {
    transform: `translate(${rect.x}px, ${rect.y}px)`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  };
}

function getPanelMargin(): number {
  return window.innerWidth <= 640 ? 12 : 20;
}

function getDefaultPanelPosition(panelWidth: number): PanelPosition {
  const margin = getPanelMargin();
  const width = Math.min(panelWidth, window.innerWidth - margin * 2);

  return {
    x: Math.max(margin, window.innerWidth - width - margin),
    y: margin
  };
}

function clampPanelPosition(position: PanelPosition, panelWidth: number, panelHeight: number): PanelPosition {
  const margin = getPanelMargin();

  return {
    x: Math.max(margin, Math.min(position.x, window.innerWidth - panelWidth - margin)),
    y: Math.max(margin, Math.min(position.y, window.innerHeight - panelHeight - margin))
  };
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function isManipulationMode(mode: OverlayMode): boolean {
  return mode === "adjust" || mode === "resize";
}

function supportsHover(mode: OverlayMode): boolean {
  return mode !== "resize";
}

function supportsSelection(mode: OverlayMode): boolean {
  return mode === "adjust" || mode === "inspect";
}

function toCopyComponent(component: NonNullable<SelectedComponent>): CopyContextComponent {
  return {
    id: component.id,
    tag: component.tag,
    classList: component.classList,
    text: component.text,
    selector: component.selector,
    domPath: component.domPath,
    parentSignature: component.parentSignature,
    ancestorTrail: component.ancestorTrail,
    semanticPath: component.semanticPath,
    closestHeading: component.closestHeading,
    landmarkHint: component.landmarkHint,
    siblingIndex: component.siblingIndex,
    siblingCount: component.siblingCount,
    childCount: component.childCount,
    testAttributes: component.testAttributes,
    role: component.role,
    ariaLabel: component.ariaLabel,
    pageUrl: window.location.href
  };
}

function buildSelectionContext(
  components: NonNullable<SelectedComponent>[],
  primary: NonNullable<SelectedComponent>,
  intent: IntentCopyContext["intent"]
): IntentCopyContext {
  return {
    primaryComponent: toCopyComponent(primary),
    components: components.map(toCopyComponent),
    intent
  };
}

function matchesSelectionContext(
  context: IntentCopyContext | null,
  components: NonNullable<SelectedComponent>[]
): context is IntentCopyContext {
  if (!context || context.components.length !== components.length) {
    return false;
  }

  const selectedIds = new Set(components.map((component) => component.id));
  return context.components.every((component) => selectedIds.has(component.id));
}

function getSelectionHeadline(
  locale: SupportedLocale,
  selectedComponents: NonNullable<SelectedComponent>[],
  primary: SelectedComponent
): string {
  if (selectedComponents.length === 0) {
    return locale === "zh-CN" ? "未选中目标" : "Nothing selected";
  }

  if (selectedComponents.length === 1 && primary) {
    return formatElementSignature(primary.tag, primary.classList);
  }

  return locale === "zh-CN" ? `已选中 ${selectedComponents.length} 个元素` : `${selectedComponents.length} elements selected`;
}

export function OverlayApp({ locale, onExit, overlayHost }: OverlayAppProps): JSX.Element {
  const [state, dispatch] = useReducer(overlayReducer, initialOverlayState);
  const [hoveredRect, setHoveredRect] = useState<Rect | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showCaptureCard, setShowCaptureCard] = useState(false);
  const [capturedContext, setCapturedContext] = useState<IntentCopyContext | null>(null);
  const [instructionDraft, setInstructionDraft] = useState("");
  const [panelPosition, setPanelPosition] = useState<PanelPosition>(() => getDefaultPanelPosition(DEFAULT_PANEL_WIDTH));
  const panelResizeRef = useRef<PanelResizeState | null>(null);
  const intentEngineRef = useRef(new IntentEngine());
  const latestSelectedRef = useRef<NonNullable<SelectedComponent>[]>(state.selectedComponents);
  const lastPreviewedComponentsRef = useRef<NonNullable<SelectedComponent>[]>([]);
  const panelRef = useRef<HTMLElement | null>(null);
  const panelDragRef = useRef<PanelDragState | null>(null);
  const primaryResizeFrameRef = useRef<HTMLDivElement | null>(null);
  const strings = getExtensionStrings(locale);
  const selectedComponents = state.selectedComponents;
  const primarySelectedComponent = getActiveSelectedComponent(state);
  const selectionKey = selectedComponents.map((component) => component.id).join("|");
  const primarySelectionKey = primarySelectedComponent?.id ?? "";
  const trimmedInstruction = instructionDraft.trim();

  useEffect(() => {
    latestSelectedRef.current = state.selectedComponents;
  }, [state.selectedComponents]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const dragState = panelDragRef.current;
      const resizeState = panelResizeRef.current;
      const panel = panelRef.current;

      if (resizeState) {
        handlePanelResizeMove(event);
        return;
      }

      if (!dragState || !panel) {
        return;
      }

      const nextPosition = clampPanelPosition(
        {
          x: dragState.originX + (event.clientX - dragState.startX),
          y: dragState.originY + (event.clientY - dragState.startY)
        },
        panel.offsetWidth,
        panel.offsetHeight
      );

      setPanelPosition(nextPosition);
    }

    function handlePointerUp() {
      panelDragRef.current = null;
      panelResizeRef.current = null;
    }

    function handleResize() {
      setPanelPosition((current) => clampPanelPosition(current, state.panelSize.width, state.panelSize.height));
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);
    };
  }, [state.panelSize]);

  useEffect(() => {
    return () => {
      latestSelectedRef.current.forEach((component) => {
        resetPreviewForElement(component.element);
      });
    };
  }, []);

  useEffect(() => {
    if (!isManipulationMode(state.mode) || selectedComponents.length === 0) {
      return;
    }

    const targets = state.mode === "adjust" ? selectedComponents : primarySelectedComponent ? [primarySelectedComponent] : [];
    const styleMode = state.mode === "adjust" ? "move" : "resize";

    targets.forEach((component) => {
      applyEditingStyles(component.element, styleMode);
    });

    return () => {
      targets.forEach((component) => {
        resetEditingStyles(component.element);
      });
    };
  }, [primarySelectedComponent, selectedComponents, state.mode]);

  useEffect(() => {
    if (!supportsHover(state.mode)) {
      setHoveredRect(null);
      setHoveredLabel(null);
      dispatch({ type: "set-hovered-element", element: null });
      return;
    }

    function handleMouseMove(event: MouseEvent) {
      if (isOverlayEvent(event, overlayHost)) {
        setHoveredRect(null);
        setHoveredLabel(null);
        dispatch({ type: "set-hovered-element", element: null });
        return;
      }

      const target = resolveSelectableElement(event.target);
      if (!target) {
        setHoveredRect(null);
        setHoveredLabel(null);
        dispatch({ type: "set-hovered-element", element: null });
        return;
      }

      dispatch({ type: "set-hovered-element", element: target });
      setHoveredRect(getElementRect(target));
      setHoveredLabel(formatElementLabel(target));
    }

    document.addEventListener("mousemove", handleMouseMove, true);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
    };
  }, [overlayHost, state.mode]);

  useEffect(() => {
    if (!supportsSelection(state.mode)) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (isOverlayEvent(event, overlayHost)) {
        return;
      }

      const target = resolveSelectableElement(event.target);
      if (!target) {
        return;
      }

      const component = createSelectedComponent(target);
      if (!component) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (event.ctrlKey || event.metaKey) {
        dispatch({
          type: "toggle-selection",
          component
        });
        return;
      }

      latestSelectedRef.current
        .filter((selected) => selected.id !== component.id)
        .forEach((selected) => resetPreviewForElement(selected.element));

      dispatch({
        type: "replace-selection",
        components: [component],
        activeSelectionId: component.id
      });
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [overlayHost, state.mode]);

  useEffect(() => {
    function syncRects() {
      if (state.hoveredElement && supportsHover(state.mode)) {
        setHoveredRect(getElementRect(state.hoveredElement));
        setHoveredLabel(formatElementLabel(state.hoveredElement));
      } else {
        setHoveredRect(null);
        setHoveredLabel(null);
      }

      if (selectedComponents.length > 0) {
        dispatch({
          type: "update-selected-rects",
          rects: selectedComponents.map((component) => ({
            id: component.id,
            rect: getElementRect(component.element)
          }))
        });
      }
    }

    syncRects();
    window.addEventListener("resize", syncRects);
    window.addEventListener("scroll", syncRects, true);

    return () => {
      window.removeEventListener("resize", syncRects);
      window.removeEventListener("scroll", syncRects, true);
    };
  }, [selectionKey, state.hoveredElement, state.mode, selectedComponents]);

  useEffect(() => {
    const currentSelectedComponents = latestSelectedRef.current;
    const currentPrimarySelectedComponent =
      currentSelectedComponents.find((component) => component.id === primarySelectionKey) ??
      currentSelectedComponents[currentSelectedComponents.length - 1] ??
      null;

    function handleGroupIntent(intent: IntentCopyContext["intent"], nextSelection: NonNullable<SelectedComponent>[]) {
      const nextPrimary = nextSelection[nextSelection.length - 1] ?? nextSelection[0];
      if (!nextPrimary) {
        return;
      }

      const nextContext = buildSelectionContext(nextSelection, nextPrimary, intent);

      console.info("[AI UI Runtime] Captured intent", intent);
      lastPreviewedComponentsRef.current = nextSelection;
      dispatch({ type: "set-last-intent", intent });
      dispatch({
        type: "replace-selection",
        components: nextSelection,
        activeSelectionId: nextPrimary.id
      });
      setCapturedContext(nextContext);
      setShowCaptureCard(true);
      setFeedback({
        kind: "success",
        message: strings.overlay.intentCaptured
      });
    }

    function handleResizeIntent(intent: IntentCopyContext["intent"], nextSelection: NonNullable<SelectedComponent>) {
      const nextContext = buildSelectionContext([nextSelection], nextSelection, intent);

      console.info("[AI UI Runtime] Captured intent", intent);
      lastPreviewedComponentsRef.current = [nextSelection];
      dispatch({ type: "set-last-intent", intent });
      dispatch({
        type: "replace-selection",
        components: [nextSelection],
        activeSelectionId: nextSelection.id
      });
      setCapturedContext(nextContext);
      setShowCaptureCard(true);
      setFeedback({
        kind: "success",
        message: strings.overlay.intentCaptured
      });
    }

    const cleanupMove = bindDragBehavior({
      mode: state.mode,
      selectedComponents: currentSelectedComponents,
      intentEngine: intentEngineRef.current,
      onSelectedRectsChange(rects) {
        dispatch({ type: "update-selected-rects", rects });
      },
      onIntent: handleGroupIntent
    });

    const cleanupResize = bindResizeBehavior({
      mode: state.mode,
      primarySelectedComponent: currentPrimarySelectedComponent,
      selectedCount: currentSelectedComponents.length,
      overlayFrameElement: primaryResizeFrameRef.current,
      intentEngine: intentEngineRef.current,
      onSelectedRectChange(rect) {
        if (!currentPrimarySelectedComponent) {
          return;
        }

        dispatch({
          type: "update-selected-rects",
          rects: [
            {
              id: currentPrimarySelectedComponent.id,
              rect
            }
          ]
        });
      },
      onIntent: handleResizeIntent
    });

    return () => {
      cleanupMove();
      cleanupResize();
    };
  }, [primarySelectionKey, selectionKey, state.mode, strings.overlay.intentCaptured]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const selectedIds = new Set(selectedComponents.map((component) => component.id));
  const hoveredMatchesSelected = state.hoveredElement ? selectedComponents.some((component) => component.element === state.hoveredElement) : false;
  const matchedCapturedContext = matchesSelectionContext(capturedContext, selectedComponents) ? capturedContext : null;
  const currentPromptContext: AiPromptContext | null = primarySelectedComponent
    ? {
        primaryComponent: toCopyComponent(primarySelectedComponent),
        components: selectedComponents.map(toCopyComponent),
        intent: matchedCapturedContext?.intent ?? null,
        userPrompt: trimmedInstruction || undefined
      }
    : null;
  const lastIntentText = matchedCapturedContext ? JSON.stringify(matchedCapturedContext.intent, null, 2) : strings.overlay.latestIntentEmpty;
  const lastActionText = matchedCapturedContext ? describeIntent(locale, matchedCapturedContext.intent) : strings.overlay.lastActionEmpty;
  const whatChangedText = matchedCapturedContext ? buildWhatChanged(locale, matchedCapturedContext) : strings.overlay.lastActionEmpty;
  const selectedHeadline = getSelectionHeadline(locale, selectedComponents, primarySelectedComponent);
  const primaryTextPreview = primarySelectedComponent?.text ?? null;
  const canUndoPreview = lastPreviewedComponentsRef.current.length > 0;
  const canCopyForAi = Boolean(currentPromptContext && (currentPromptContext.intent || currentPromptContext.userPrompt));
  const canCopyFullContext = canCopyForAi;
  const canCopyJson = Boolean(currentPromptContext?.intent);
  const quickActionHint = canCopyForAi ? strings.overlay.aiCopyHint : strings.overlay.copyForAiEmptyHint;
  const panelStyle: CSSProperties = {
    top: `${panelPosition.y}px`,
    left: `${panelPosition.x}px`,
    right: "auto",
    width: `${state.panelSize.width}px`,
    height: `${state.panelSize.height}px`
  };

  function handlePanelResizeStart(event: ReactPointerEvent<HTMLElement>, edge: PanelResizeState["edge"]) {
    event.preventDefault();
    event.stopPropagation();

    panelResizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: state.panelSize.width,
      startHeight: state.panelSize.height,
      startLeft: panelPosition.x,
      startTop: panelPosition.y,
      edge
    };

    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePanelResizeMove(event: PointerEvent) {
    const resizeState = panelResizeRef.current;
    if (!resizeState) {
      return;
    }

    const margin = getPanelMargin();
    const minLeft = margin;
    const minTop = margin;
    const maxRight = window.innerWidth - margin;
    const maxBottom = window.innerHeight - margin;

    const clampedClientX = Math.max(0, Math.min(event.clientX, window.innerWidth));
    const clampedClientY = Math.max(0, Math.min(event.clientY, window.innerHeight));
    const deltaX = clampedClientX - resizeState.startX;
    const deltaY = clampedClientY - resizeState.startY;

    let newWidth = resizeState.startWidth;
    let newHeight = resizeState.startHeight;
    let newLeft = resizeState.startLeft;
    let newTop = resizeState.startTop;

    if (resizeState.edge.includes("right")) {
      newWidth = resizeState.startWidth + deltaX;
    }
    if (resizeState.edge.includes("left")) {
      newWidth = resizeState.startWidth - deltaX;
      newLeft = resizeState.startLeft + deltaX;
    }
    if (resizeState.edge.includes("bottom")) {
      newHeight = resizeState.startHeight + deltaY;
    }
    if (resizeState.edge.includes("top")) {
      newHeight = resizeState.startHeight - deltaY;
      newTop = resizeState.startTop + deltaY;
    }

    const clampedLeft = Math.max(minLeft, Math.min(newLeft, maxRight - MIN_PANEL_WIDTH));
    const clampedTop = Math.max(minTop, Math.min(newTop, maxBottom - MIN_PANEL_HEIGHT));
    const availableWidth = maxRight - clampedLeft;
    const availableHeight = maxBottom - clampedTop;
    
    const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(newWidth, availableWidth));
    const clampedHeight = Math.max(MIN_PANEL_HEIGHT, Math.min(newHeight, availableHeight));

    dispatch({ type: "set-panel-size", size: { width: clampedWidth, height: clampedHeight } });
    setPanelPosition({ x: clampedLeft, y: clampedTop });
  }

  function handlePanelResizeEnd() {
    panelResizeRef.current = null;
  }

  function setMode(mode: OverlayMode) {
    if (mode === "resize" && selectedComponents.length === 0) {
      setFeedback({
        kind: "error",
        message: strings.overlay.selectBeforeResize
      });
      return;
    }

    if (mode === "resize" && selectedComponents.length > 1) {
      if (!primarySelectedComponent) {
        setFeedback({
          kind: "error",
          message: strings.overlay.resizeSingleOnly
        });
        return;
      }

      dispatch({
        type: "replace-selection",
        components: [primarySelectedComponent],
        activeSelectionId: primarySelectedComponent.id
      });
      dispatch({ type: "set-mode", mode });
      setFeedback({
        kind: "success",
        message: strings.overlay.resizeFocusedPrimary
      });
      return;
    }

    dispatch({ type: "set-mode", mode });
  }

  async function handleCopy(factory: () => string, successMessage: string) {
    try {
      await copyText(factory());
      setFeedback({
        kind: "success",
        message: successMessage
      });
    } catch {
      setFeedback({
        kind: "error",
        message: strings.overlay.copyFailure
      });
    }
  }

  function handleClearPrompt() {
    if (!instructionDraft) {
      return;
    }

    setInstructionDraft("");
    setFeedback({
      kind: "success",
      message: strings.overlay.clearPromptSuccess
    });
  }

  function handleUndoPreview() {
    const targets = lastPreviewedComponentsRef.current;
    if (targets.length === 0) {
      return;
    }

    const rects = targets.map((component) => ({
      id: component.id,
      rect: resetPreviewForElement(component.element)
    }));

    dispatch({ type: "update-selected-rects", rects });
    dispatch({ type: "set-last-intent", intent: null });
    setCapturedContext(null);
    setShowCaptureCard(false);
    lastPreviewedComponentsRef.current = [];
    setFeedback({
      kind: "success",
      message: strings.overlay.previewResetSuccess
    });
  }

  function handlePanelPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || !panelRef.current) {
      return;
    }

    event.preventDefault();
    panelDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: panelPosition.x,
      originY: panelPosition.y
    };
  }

  return (
    <div className="aiui-root">
      {!hoveredMatchesSelected && hoveredRect ? (
        <div className="aiui-frame aiui-frame--hover" style={toFrameStyle(hoveredRect)}>
          <span className="aiui-frame__label">{hoveredLabel ?? strings.overlay.hoverLabel}</span>
        </div>
      ) : null}

      {selectedComponents.map((component) => {
        const isPrimary = component.id === primarySelectedComponent?.id;
        return (
          <div
            key={component.id}
            ref={isPrimary ? primaryResizeFrameRef : null}
            className={`aiui-frame ${
              isPrimary ? "aiui-frame--selected" : "aiui-frame--selected aiui-frame--group"
            } ${isPrimary && state.mode === "resize" ? "aiui-frame--resize-active" : ""}`}
            style={toFrameStyle(component.rect)}
          >
            {isPrimary ? (
              <>
                <span className="aiui-frame__label">{formatElementSignature(component.tag, component.classList)}</span>
                {state.mode === "resize" ? (
                  <>
                    <span className="aiui-frame__handle aiui-frame__handle--top-left" />
                    <span className="aiui-frame__handle aiui-frame__handle--top-right" />
                    <span className="aiui-frame__handle aiui-frame__handle--top" />
                    <span className="aiui-frame__handle aiui-frame__handle--right" />
                    <span className="aiui-frame__handle aiui-frame__handle--bottom-left" />
                    <span className="aiui-frame__handle aiui-frame__handle--bottom-right" />
                    <span className="aiui-frame__handle aiui-frame__handle--bottom" />
                    <span className="aiui-frame__handle aiui-frame__handle--left" />
                  </>
                ) : null}
              </>
            ) : (
              <span className="aiui-frame__badge">{selectedIds.size}</span>
            )}
          </div>
        );
      })}

      <aside
        ref={panelRef}
        className="aiui-panel aiui-panel--resizable"
        data-ai-ui-runtime-ignore="true"
        aria-label={strings.overlay.title}
        style={panelStyle}
      >
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--top"
          onPointerDown={(e) => handlePanelResizeStart(e, "top")}
        />
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--right"
          onPointerDown={(e) => handlePanelResizeStart(e, "right")}
        />
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--bottom"
          onPointerDown={(e) => handlePanelResizeStart(e, "bottom")}
        />
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--left"
          onPointerDown={(e) => handlePanelResizeStart(e, "left")}
        />
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--top-right"
          onPointerDown={(e) => handlePanelResizeStart(e, "top-right")}
        />
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--bottom-right"
          onPointerDown={(e) => handlePanelResizeStart(e, "bottom-right")}
        />
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--bottom-left"
          onPointerDown={(e) => handlePanelResizeStart(e, "bottom-left")}
        />
        <div
          className="aiui-panel__resize-handle aiui-panel__resize-handle--top-left"
          onPointerDown={(e) => handlePanelResizeStart(e, "top-left")}
        />
        <div className="aiui-panel__content">
          <div className="aiui-panel__header aiui-panel__drag-handle" onPointerDown={handlePanelPointerDown}>
            <div>
              <p className="aiui-panel__eyebrow">{strings.overlay.eyebrow}</p>
              <h2>{strings.overlay.title}</h2>
              <p className="aiui-status-line">{strings.overlay.enabledStatus}</p>
            </div>
            <div className="aiui-mode-box">
              <span className="aiui-mode-box__label">{strings.overlay.modeLabel}</span>
              <span className={`aiui-mode-chip aiui-mode-chip--${state.mode}`}>{strings.overlay.modes[state.mode]}</span>
            </div>
          </div>

          <div className="aiui-toolbar" role="tablist" aria-label={strings.overlay.modeLabel}>
            <button
              type="button"
              className={`aiui-toolbar__button ${state.mode === "adjust" ? "is-active" : ""}`}
              onClick={() => setMode("adjust")}
            >
              {strings.overlay.modes.adjust}
            </button>
            <button
              type="button"
              className={`aiui-toolbar__button ${state.mode === "resize" ? "is-active" : ""}`}
              onClick={() => setMode("resize")}
              disabled={selectedComponents.length === 0}
            >
              {strings.overlay.modes.resize}
            </button>
            <button
              type="button"
              className={`aiui-toolbar__button ${state.mode === "inspect" ? "is-active" : ""}`}
              onClick={() => setMode("inspect")}
            >
              {strings.overlay.modes.inspect}
            </button>
          </div>

          <section className="aiui-panel__section">
            <p className="aiui-panel__label">{strings.overlay.modeHelpTitle}</p>
            <div className="aiui-guidance-card">
              <p className="aiui-panel__note">{strings.overlay.modeGuidance[state.mode]}</p>
            </div>
            <p className="aiui-panel__note">{strings.overlay.multiSelectHint}</p>
          </section>

          {showCaptureCard && matchedCapturedContext ? (
            <section className="aiui-capture-card">
              <div className="aiui-capture-card__header">
                <div>
                  <p className="aiui-panel__label">{strings.overlay.captureTitle}</p>
                  <strong>{describeIntent(locale, matchedCapturedContext.intent)}</strong>
                </div>
                <button className="aiui-inline-button" type="button" onClick={() => setShowCaptureCard(false)}>
                  {strings.overlay.dismiss}
                </button>
              </div>
            </section>
          ) : null}

          <section className="aiui-panel__section">
            <p className="aiui-panel__label">{strings.overlay.selectedSummaryTitle}</p>
            {selectedComponents.length > 0 ? (
              <div className="aiui-target-card">
                <strong>{selectedHeadline}</strong>
                <p>
                  {strings.overlay.selectedCountLabel}: {selectedComponents.length}
                </p>
                {primaryTextPreview ? (
                  <p>
                    {strings.overlay.selectedTextLabel}: {primaryTextPreview}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="aiui-empty">{strings.overlay.emptySelection}</p>
            )}
          </section>

          {state.mode === "inspect" ? (
            <section className="aiui-panel__section">
              <div className="aiui-panel__section-header">
                <p className="aiui-panel__label">{strings.overlay.promptComposerTitle}</p>
                <span className="aiui-panel__hint">
                  {trimmedInstruction ? strings.overlay.promptReadyHint : strings.overlay.promptHint}
                </span>
              </div>
              <textarea
                className="aiui-prompt-input"
                value={instructionDraft}
                onChange={(event) => setInstructionDraft(event.target.value)}
                placeholder={
                  selectedComponents.length > 0 ? strings.overlay.promptPlaceholder : strings.overlay.promptDisabledPlaceholder
                }
                disabled={selectedComponents.length === 0}
                rows={5}
              />
              <div className="aiui-prompt-footer">
                <p className="aiui-panel__note">{strings.overlay.promptSelectionHint}</p>
                <button
                  className="aiui-text-button"
                  type="button"
                  onClick={handleClearPrompt}
                  disabled={instructionDraft.length === 0}
                >
                  {strings.overlay.clearPrompt}
                </button>
              </div>
            </section>
          ) : null}

          <section className="aiui-panel__section">
            <p className="aiui-panel__label">{strings.overlay.whatChangedTitle}</p>
            <pre className="aiui-summary-output">{whatChangedText || lastActionText}</pre>
          </section>

          <section className="aiui-panel__section">
            <p className="aiui-panel__label">{strings.overlay.quickActionsTitle}</p>
            <div className="aiui-primary-actions">
              <button
                className="aiui-primary-action"
                type="button"
                disabled={!canCopyForAi}
                onClick={() =>
                  currentPromptContext
                    ? handleCopy(() => buildAiPrompt(locale, currentPromptContext), strings.overlay.copyForAiSuccess)
                    : undefined
                }
              >
                {strings.overlay.copyForAi}
              </button>
              <button className="aiui-secondary-action" type="button" disabled={!canUndoPreview} onClick={handleUndoPreview}>
                {strings.overlay.undoPreview}
              </button>
            </div>
            <p className="aiui-panel__note">{quickActionHint}</p>
            <p className="aiui-panel__note">{strings.overlay.resetPreviewHint}</p>
          </section>

          <section className="aiui-panel__section">
            <details className="aiui-disclosure">
              <summary className="aiui-disclosure__summary">
                <span className="aiui-panel__label">{strings.overlay.advancedTitle}</span>
                <span className="aiui-panel__hint">{strings.overlay.advancedHint}</span>
              </summary>

              <div className="aiui-disclosure__content">
                <section className="aiui-panel__section">
                  <p className="aiui-panel__label">{strings.overlay.selectedTitle}</p>
                  <p className="aiui-panel__note">{strings.overlay.hierarchyHint}</p>
                  {selectedComponents.length > 0 ? (
                    <dl className="aiui-details">
                      {selectedComponents.map((component) => (
                        <div key={component.id}>
                          <dt>{formatElementSignature(component.tag, component.classList)}</dt>
                          <dd>
                            {strings.overlay.fields.selector}: {component.selector}
                          </dd>
                          <dd>
                            {strings.overlay.fields.domPath}: {component.domPath}
                          </dd>
                          {component.semanticPath ? (
                            <dd>
                              {strings.overlay.fields.semanticPath}: {component.semanticPath}
                            </dd>
                          ) : null}
                          {component.ancestorTrail.length > 0 ? (
                            <dd>
                              {strings.overlay.fields.ancestorTrail}: {component.ancestorTrail.join(" > ")}
                            </dd>
                          ) : null}
                          {component.closestHeading ? (
                            <dd>
                              {strings.overlay.fields.closestHeading}: {component.closestHeading}
                            </dd>
                          ) : null}
                          {component.landmarkHint ? (
                            <dd>
                              {strings.overlay.fields.landmarkHint}: {component.landmarkHint}
                            </dd>
                          ) : null}
                          <dd>
                            {strings.overlay.fields.siblingPosition}: {component.siblingIndex}/{component.siblingCount}
                          </dd>
                          <dd>
                            {strings.overlay.fields.childCount}: {component.childCount}
                          </dd>
                          {component.testAttributes.length > 0 ? (
                            <dd>
                              {strings.overlay.fields.testAttributes}: {component.testAttributes.join(", ")}
                            </dd>
                          ) : null}
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="aiui-empty">{strings.overlay.emptySelection}</p>
                  )}
                </section>

                <section className="aiui-panel__section">
                  <div className="aiui-panel__section-header">
                    <p className="aiui-panel__label">{strings.overlay.latestIntentTitle}</p>
                    <span className="aiui-panel__hint">{strings.overlay.controlsHint}</span>
                  </div>
                  <pre className="aiui-intent-output" aria-live="polite">
                    {lastIntentText}
                  </pre>
                </section>

                <section className="aiui-panel__section">
                  <p className="aiui-panel__label">{strings.overlay.useWithAiTitle}</p>
                  <div className="aiui-actions-grid">
                    <button
                      className="aiui-secondary-action"
                      type="button"
                      disabled={!canCopyJson}
                      onClick={() =>
                        currentPromptContext?.intent
                          ? handleCopy(() => JSON.stringify(currentPromptContext.intent, null, 2), strings.overlay.copyJsonSuccess)
                          : undefined
                      }
                    >
                      {strings.overlay.copyJson}
                    </button>
                    <button
                      className="aiui-secondary-action"
                      type="button"
                      disabled={!canCopyFullContext}
                      onClick={() =>
                        currentPromptContext
                          ? handleCopy(() => buildFullContext(locale, currentPromptContext), strings.overlay.copyFullContextSuccess)
                          : undefined
                      }
                    >
                      {strings.overlay.copyFullContext}
                    </button>
                  </div>
                </section>
              </div>
            </details>
          </section>

          <button className="aiui-exit-button" type="button" onClick={onExit}>
            {strings.overlay.exit}
          </button>
        </div>
      </aside>

      {feedback ? (
        <div className={`aiui-toast aiui-toast--${feedback.kind}`} data-ai-ui-runtime-ignore="true">
          {feedback.message}
        </div>
      ) : null}
    </div>
  );
}
