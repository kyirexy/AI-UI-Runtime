import type { Rect } from "@ai-ui-runtime/shared";
import { getElementRect } from "@ai-ui-runtime/ui-runtime";

type PreviewState = {
  baseTransform: string;
  baseWidth: string;
  baseHeight: string;
  x: number;
  y: number;
};

type InteractionStyleState = {
  boxSizing: string;
  cursor: string;
  display: string;
  touchAction: string;
  userSelect: string;
  webkitUserSelect: string;
  webkitUserDrag: string;
  willChange: string;
};

const previewByElement = new WeakMap<HTMLElement, PreviewState>();
const interactionStyleByElement = new WeakMap<HTMLElement, InteractionStyleState>();

function composeTransform(baseTransform: string, x: number, y: number): string {
  const translate = `translate(${x}px, ${y}px)`;
  return baseTransform ? `${baseTransform} ${translate}` : translate;
}

function applyPreviewState(element: HTMLElement, state: PreviewState) {
  element.style.transform = composeTransform(state.baseTransform, state.x, state.y);
}

function getOrCreatePreviewState(element: HTMLElement): PreviewState {
  const existing = previewByElement.get(element);
  if (existing) {
    return existing;
  }

  const nextState: PreviewState = {
    baseTransform: element.style.transform,
    baseWidth: element.style.width,
    baseHeight: element.style.height,
    x: 0,
    y: 0
  };

  previewByElement.set(element, nextState);
  return nextState;
}

export function updatePreviewTranslation(element: HTMLElement, deltaX: number, deltaY: number): PreviewState {
  const state = getOrCreatePreviewState(element);
  state.x += deltaX;
  state.y += deltaY;
  applyPreviewState(element, state);
  return state;
}

export function setPreviewSize(element: HTMLElement, width: number, height: number): PreviewState {
  const state = getOrCreatePreviewState(element);
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  applyPreviewState(element, state);
  return state;
}

export function resetPreviewForElement(element: HTMLElement): Rect {
  const preview = previewByElement.get(element);
  if (!preview) {
    return getElementRect(element);
  }

  element.style.transform = preview.baseTransform;
  element.style.width = preview.baseWidth;
  element.style.height = preview.baseHeight;
  previewByElement.delete(element);

  return getElementRect(element);
}

export function applyEditingStyles(element: HTMLElement, mode: "move" | "resize"): void {
  const existingState = interactionStyleByElement.get(element);

  if (!existingState) {
    interactionStyleByElement.set(element, {
      boxSizing: element.style.boxSizing,
      cursor: element.style.cursor,
      display: element.style.display,
      touchAction: element.style.touchAction,
      userSelect: element.style.userSelect,
      webkitUserSelect: element.style.webkitUserSelect,
      webkitUserDrag: element.style.getPropertyValue("-webkit-user-drag"),
      willChange: element.style.willChange
    });
  }

  if (window.getComputedStyle(element).display === "inline") {
    element.style.display = "inline-block";
  }

  element.style.boxSizing = "border-box";
  element.style.touchAction = "none";
  element.style.userSelect = "none";
  element.style.webkitUserSelect = "none";
  element.style.setProperty("-webkit-user-drag", "none");
  element.style.willChange = "transform, width, height";
  element.style.cursor = mode === "move" ? "grab" : "nwse-resize";
}

export function resetEditingStyles(element: HTMLElement): void {
  const styles = interactionStyleByElement.get(element);
  if (!styles) {
    return;
  }

  element.style.boxSizing = styles.boxSizing;
  element.style.cursor = styles.cursor;
  element.style.display = styles.display;
  element.style.touchAction = styles.touchAction;
  element.style.userSelect = styles.userSelect;
  element.style.webkitUserSelect = styles.webkitUserSelect;
  if (styles.webkitUserDrag) {
    element.style.setProperty("-webkit-user-drag", styles.webkitUserDrag);
  } else {
    element.style.removeProperty("-webkit-user-drag");
  }
  element.style.willChange = styles.willChange;
  interactionStyleByElement.delete(element);
}
