import { inspectElement } from "@ai-ui-runtime/ui-runtime";
import type { SelectedComponent } from "./state";

const TEXT_LIKE_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "STRONG", "EM", "SMALL"]);
const SELF_STABLE_TAGS = new Set(["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT", "LABEL", "IMG", "VIDEO", "CANVAS"]);

function toHTMLElement(target: EventTarget | null): HTMLElement | null {
  if (target instanceof HTMLElement) {
    return target;
  }

  if (target instanceof Element) {
    let current: Element | null = target;
    while (current && !(current instanceof HTMLElement)) {
      current = current.parentElement;
    }

    return current;
  }

  return null;
}

function escapeSelectorFragment(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function buildClassSignature(element: HTMLElement): string {
  const classNames = Array.from(element.classList).filter(Boolean).slice(0, 2);
  return classNames.length > 0 ? `.${classNames.map(escapeSelectorFragment).join(".")}` : "";
}

function buildNthOfTypeSelector(element: HTMLElement): string {
  const parent = element.parentElement;
  if (!parent) {
    return "";
  }

  const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
  if (siblings.length <= 1) {
    return "";
  }

  const index = siblings.indexOf(element) + 1;
  return index > 0 ? `:nth-of-type(${index})` : "";
}

function buildSelectorSegment(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  if (element.id) {
    return `${tag}#${escapeSelectorFragment(element.id)}`;
  }

  const classSignature = buildClassSignature(element);
  if (classSignature) {
    return `${tag}${classSignature}`;
  }

  return `${tag}${buildNthOfTypeSelector(element)}`;
}

function buildDomPath(element: HTMLElement, depth = 5): string {
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && segments.length < depth) {
    if (current.tagName === "BODY" || current.tagName === "HTML") {
      break;
    }

    segments.unshift(buildSelectorSegment(current));
    current = current.parentElement;
  }

  return segments.join(" > ");
}

function getTextPreview(element: HTMLElement): string | undefined {
  const text = element.textContent?.replace(/\s+/g, " ").trim();
  if (!text) {
    return undefined;
  }

  return text.slice(0, 80);
}

function getAttributePreview(element: HTMLElement, name: string): string | undefined {
  const value = element.getAttribute(name)?.replace(/\s+/g, " ").trim();
  return value ? value.slice(0, 80) : undefined;
}

function getParentSignature(element: HTMLElement): string | undefined {
  const parent = element.parentElement;
  if (!parent || parent.tagName === "BODY" || parent.tagName === "HTML") {
    return undefined;
  }

  return buildSelectorSegment(parent);
}

function isTextLikeElement(element: HTMLElement): boolean {
  return TEXT_LIKE_TAGS.has(element.tagName);
}

function isStableStandaloneElement(element: HTMLElement): boolean {
  return SELF_STABLE_TAGS.has(element.tagName);
}

function shouldPromoteSelection(element: HTMLElement): boolean {
  if (isStableStandaloneElement(element)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const area = rect.width * rect.height;

  return (
    isTextLikeElement(element) ||
    style.display === "inline" ||
    (element.childElementCount === 0 && area < 6400) ||
    rect.height < 28
  );
}

function isReasonablePromotionTarget(current: HTMLElement, candidate: HTMLElement): boolean {
  if (candidate.tagName === "BODY" || candidate.tagName === "HTML") {
    return false;
  }

  const currentRect = current.getBoundingClientRect();
  const candidateRect = candidate.getBoundingClientRect();
  const currentArea = Math.max(1, currentRect.width * currentRect.height);
  const candidateArea = candidateRect.width * candidateRect.height;

  if (candidateArea > window.innerWidth * window.innerHeight * 0.72) {
    return false;
  }

  if (candidateArea > currentArea * 30) {
    return false;
  }

  const style = window.getComputedStyle(candidate);
  const isLayoutContainer =
    style.display === "block" ||
    style.display === "flex" ||
    style.display === "grid" ||
    style.display === "inline-flex" ||
    style.display === "inline-grid";

  return isLayoutContainer || candidate.classList.length > 0 || candidate.childElementCount > 1 || candidate.hasAttribute("role");
}

function resolvePreferredSelectionTarget(element: HTMLElement): HTMLElement {
  if (!shouldPromoteSelection(element)) {
    return element;
  }

  let current = element;
  let best = element;
  let depth = 0;

  while (current.parentElement && depth < 4) {
    const parent = current.parentElement;
    const parentComponent = inspectElement(parent);
    if (!parentComponent) {
      break;
    }

    if (isReasonablePromotionTarget(current, parent)) {
      best = parent;
      break;
    }

    current = parent;
    depth += 1;
  }

  return best;
}

export function isOverlayEvent(event: Event, overlayHost: HTMLElement): boolean {
  return event.composedPath().includes(overlayHost);
}

export function resolveSelectableElement(target: EventTarget | null): HTMLElement | null {
  let candidate = toHTMLElement(target);

  while (candidate) {
    if (candidate.dataset.aiUiRuntimeIgnore === "true") {
      return null;
    }

    const component = inspectElement(candidate);
    if (component) {
      return resolvePreferredSelectionTarget(candidate);
    }

    candidate = candidate.parentElement;
  }

  return null;
}

export function createSelectedComponent(element: HTMLElement | null): SelectedComponent {
  if (!element) {
    return null;
  }

  const component = inspectElement(element);
  if (!component) {
    return null;
  }

  return {
    ...component,
    text: component.text ?? getTextPreview(element),
    selector: buildSelectorSegment(element),
    domPath: buildDomPath(element),
    parentSignature: getParentSignature(element),
    role: getAttributePreview(element, "role"),
    ariaLabel: getAttributePreview(element, "aria-label"),
    element
  };
}

export function formatElementLabel(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const classNames = Array.from(element.classList).filter(Boolean).slice(0, 2);

  if (classNames.length === 0) {
    return tag;
  }

  return `${tag}.${classNames.join(".")}`;
}
