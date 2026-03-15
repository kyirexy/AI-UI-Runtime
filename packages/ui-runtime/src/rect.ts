import type { Rect } from "@ai-ui-runtime/shared";

export const MIN_VISIBLE_SIZE = 4;

export function domRectToRect(domRect: DOMRect | DOMRectReadOnly): Rect {
  return {
    x: domRect.x,
    y: domRect.y,
    width: domRect.width,
    height: domRect.height
  };
}

export function getElementRect(element: Element): Rect {
  return domRectToRect(element.getBoundingClientRect());
}

export function rectHasVisibleArea(rect: Rect, minSize = MIN_VISIBLE_SIZE): boolean {
  return rect.width >= minSize && rect.height >= minSize;
}
