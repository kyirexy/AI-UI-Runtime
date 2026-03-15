import type { UIComponent } from "@ai-ui-runtime/shared";
import { getOrCreateComponentId } from "./id";
import { getElementRect, rectHasVisibleArea } from "./rect";

const IGNORED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "META",
  "LINK",
  "HEAD",
  "HTML",
  "BODY"
]);

function isHTMLElement(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isIgnoredElement(element: HTMLElement): boolean {
  if (IGNORED_TAGS.has(element.tagName)) {
    return true;
  }

  if (element.dataset.aiUiRuntimeIgnore === "true") {
    return true;
  }

  return element.closest("[data-ai-ui-runtime-ignore='true']") !== null;
}

function isVisibleElement(element: HTMLElement): boolean {
  if (element.hidden) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.visibility === "collapse" ||
    Number.parseFloat(style.opacity) === 0
  ) {
    return false;
  }

  return rectHasVisibleArea(getElementRect(element));
}

function getTextPreview(element: HTMLElement): string | undefined {
  const rawText = element.textContent?.replace(/\s+/g, " ").trim();
  if (!rawText) {
    return undefined;
  }

  return rawText.slice(0, 30);
}

export function inspectElement(element: Element | null): UIComponent | null {
  if (!isHTMLElement(element) || isIgnoredElement(element) || !isVisibleElement(element)) {
    return null;
  }

  return {
    id: getOrCreateComponentId(element),
    tag: element.tagName.toLowerCase(),
    classList: Array.from(element.classList),
    text: getTextPreview(element),
    rect: getElementRect(element)
  };
}

export function scanVisibleComponents(root: ParentNode = document): UIComponent[] {
  const scanRoot = root instanceof Document ? root.body ?? root.documentElement : root;
  if (!scanRoot) {
    return [];
  }

  const nodes = scanRoot.querySelectorAll("*");
  const components: UIComponent[] = [];

  nodes.forEach((node) => {
    const component = inspectElement(node);
    if (component) {
      components.push(component);
    }
  });

  return components;
}
