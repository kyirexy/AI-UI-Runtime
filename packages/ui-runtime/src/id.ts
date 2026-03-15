import { generateId } from "@ai-ui-runtime/shared";

const componentIds = new WeakMap<Element, string>();

export function getOrCreateComponentId(element: Element): string {
  const existingId = componentIds.get(element);
  if (existingId) {
    return existingId;
  }

  const nextId = generateId("component");
  componentIds.set(element, nextId);
  return nextId;
}

export function createComponentId(): string {
  return generateId("component");
}
