import { IntentEngine } from "@ai-ui-runtime/intent-engine";
import type { Rect, UIIntent } from "@ai-ui-runtime/shared";
import { getElementRect } from "@ai-ui-runtime/ui-runtime";
import interact from "interactjs";
import type { OverlayMode, SelectedComponent } from "./state";
import { resetPreviewForElement, updatePreviewTranslation } from "./preview";

type SelectedRectUpdate = {
  id: string;
  rect: Rect;
};

type DragBindingOptions = {
  mode: OverlayMode;
  selectedComponents: NonNullable<SelectedComponent>[];
  intentEngine: IntentEngine;
  onIntent: (intent: UIIntent, nextSelection: NonNullable<SelectedComponent>[]) => void;
  onSelectedRectsChange: (rects: SelectedRectUpdate[]) => void;
};

export function bindDragBehavior(options: DragBindingOptions): () => void {
  if (options.mode !== "adjust" || options.selectedComponents.length === 0) {
    return () => undefined;
  }

  const selectedComponents = options.selectedComponents;
  let beforeRectsById = new Map<string, Rect>();

  const interactables = selectedComponents.map((selectedComponent) =>
    interact(selectedComponent.element).draggable({
      listeners: {
        start() {
          beforeRectsById = new Map(selectedComponents.map((component) => [component.id, getElementRect(component.element)]));
        },
        move(event) {
          const rects = selectedComponents.map((component) => {
            updatePreviewTranslation(component.element, event.dx, event.dy);
            return {
              id: component.id,
              rect: getElementRect(component.element)
            };
          });

          options.onSelectedRectsChange(rects);
        },
        end() {
          const afterRects = selectedComponents.map((component) => ({
            id: component.id,
            rect: getElementRect(component.element)
          }));

          options.onSelectedRectsChange(afterRects);

          const nextSelection = selectedComponents.map((component) => ({
            ...component,
            rect: afterRects.find((item) => item.id === component.id)?.rect ?? component.rect
          }));

          const intent =
            nextSelection.length === 1
              ? options.intentEngine.createMoveIntent({
                  componentId: nextSelection[0].id,
                  before: beforeRectsById.get(nextSelection[0].id) ?? nextSelection[0].rect,
                  after: nextSelection[0].rect
                })
              : options.intentEngine.createGroupMoveIntent({
                  componentIds: nextSelection.map((component) => component.id),
                  members: nextSelection.map((component) => ({
                    componentId: component.id,
                    before: beforeRectsById.get(component.id) ?? component.rect,
                    after: component.rect
                  }))
                });

          options.onIntent(intent, nextSelection);
        }
      }
    })
  );

  return () => {
    interactables.forEach((interactable) => interactable.unset());
  };
}

export { resetPreviewForElement };
