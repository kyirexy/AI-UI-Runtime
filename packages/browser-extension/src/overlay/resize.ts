import { IntentEngine } from "@ai-ui-runtime/intent-engine";
import type { Rect, UIIntent } from "@ai-ui-runtime/shared";
import { getElementRect } from "@ai-ui-runtime/ui-runtime";
import interact from "interactjs";
import { setPreviewSize, updatePreviewTranslation } from "./preview";
import type { OverlayMode, SelectedComponent } from "./state";

type ResizeBindingOptions = {
  mode: OverlayMode;
  primarySelectedComponent: SelectedComponent;
  selectedCount: number;
  intentEngine: IntentEngine;
  onIntent: (intent: UIIntent, nextSelection: NonNullable<SelectedComponent>) => void;
  onSelectedRectChange: (rect: Rect) => void;
};

const MIN_PREVIEW_WIDTH = 48;
const MIN_PREVIEW_HEIGHT = 40;

export function bindResizeBehavior(options: ResizeBindingOptions): () => void {
  if (!options.primarySelectedComponent || options.mode !== "resize" || options.selectedCount !== 1) {
    return () => undefined;
  }

  const selectedComponent = options.primarySelectedComponent;
  const target = selectedComponent.element;
  let beforeRect = getElementRect(target);

  const interactable = interact(target).resizable({
    edges: {
      top: true,
      right: true,
      bottom: true,
      left: true
    },
    modifiers: [
      interact.modifiers.restrictSize({
        min: {
          width: MIN_PREVIEW_WIDTH,
          height: MIN_PREVIEW_HEIGHT
        }
      })
    ],
    listeners: {
      start() {
        beforeRect = getElementRect(target);
      },
      move(event) {
        updatePreviewTranslation(target, event.deltaRect.left, event.deltaRect.top);
        setPreviewSize(target, event.rect.width, event.rect.height);
        options.onSelectedRectChange(getElementRect(target));
      },
      end() {
        const afterRect = getElementRect(target);
        options.onSelectedRectChange(afterRect);

        const intent = options.intentEngine.createResizeIntent({
          componentId: selectedComponent.id,
          before: beforeRect,
          after: afterRect
        });

        options.onIntent(intent, {
          ...selectedComponent,
          rect: afterRect
        });
      }
    }
  });

  return () => {
    interactable.unset();
  };
}
