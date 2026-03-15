import type { Rect, UIIntent } from "@ai-ui-runtime/shared";

export type OverlayMode = "adjust" | "inspect" | "resize";

export type SelectedComponent = {
  id: string;
  tag: string;
  classList: string[];
  text?: string;
  selector: string;
  domPath: string;
  parentSignature?: string;
  role?: string;
  ariaLabel?: string;
  rect: Rect;
  element: HTMLElement;
} | null;

export type OverlayState = {
  mode: OverlayMode;
  hoveredElement: HTMLElement | null;
  selectedComponents: NonNullable<SelectedComponent>[];
  activeSelectionId: string | null;
  lastIntent: UIIntent | null;
};

export type OverlayAction =
  | {
      type: "set-mode";
      mode: OverlayMode;
    }
  | {
      type: "set-hovered-element";
      element: HTMLElement | null;
    }
  | {
      type: "replace-selection";
      components: NonNullable<SelectedComponent>[];
      activeSelectionId: string | null;
    }
  | {
      type: "toggle-selection";
      component: NonNullable<SelectedComponent>;
    }
  | {
      type: "set-last-intent";
      intent: UIIntent | null;
    }
  | {
      type: "update-selected-rects";
      rects: Array<{
        id: string;
        rect: Rect;
      }>;
    };

export const initialOverlayState: OverlayState = {
  mode: "adjust",
  hoveredElement: null,
  selectedComponents: [],
  activeSelectionId: null,
  lastIntent: null
};

function isSameRect(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

function normalizeSelection(components: NonNullable<SelectedComponent>[]): NonNullable<SelectedComponent>[] {
  return components.filter((component, index) => {
    return components.findIndex((item) => item.id === component.id) === index;
  });
}

function withoutNestedSelections(
  components: NonNullable<SelectedComponent>[],
  candidate: NonNullable<SelectedComponent>
): NonNullable<SelectedComponent>[] {
  return components.filter((component) => {
    if (component.id === candidate.id) {
      return false;
    }

    const componentContainsCandidate = component.element.contains(candidate.element);
    const candidateContainsComponent = candidate.element.contains(component.element);

    // Keep only one level in the selection group to avoid double transforms.
    return !componentContainsCandidate && !candidateContainsComponent;
  });
}

export function getActiveSelectedComponent(state: OverlayState): SelectedComponent {
  if (state.selectedComponents.length === 0) {
    return null;
  }

  return (
    state.selectedComponents.find((component) => component.id === state.activeSelectionId) ??
    state.selectedComponents[state.selectedComponents.length - 1] ??
    null
  );
}

export function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState {
  switch (action.type) {
    case "set-mode":
      return {
        ...state,
        mode: action.mode,
        hoveredElement: action.mode === "resize" ? null : state.hoveredElement
      };
    case "set-hovered-element":
      return {
        ...state,
        hoveredElement: action.element
      };
    case "replace-selection": {
      const nextSelection = normalizeSelection(action.components);

      return {
        ...state,
        selectedComponents: nextSelection,
        activeSelectionId: nextSelection.length === 0 ? null : action.activeSelectionId
      };
    }
    case "toggle-selection": {
      const existing = state.selectedComponents.find((component) => component.id === action.component.id);
      if (existing) {
        const nextSelection = state.selectedComponents.filter((component) => component.id !== action.component.id);
        const nextActiveId =
          state.activeSelectionId === action.component.id ? nextSelection[nextSelection.length - 1]?.id ?? null : state.activeSelectionId;

        return {
          ...state,
          selectedComponents: nextSelection,
          activeSelectionId: nextActiveId
        };
      }

      const baseSelection = withoutNestedSelections(state.selectedComponents, action.component);
      const nextSelection = [...baseSelection, action.component];

      return {
        ...state,
        selectedComponents: nextSelection,
        activeSelectionId: action.component.id
      };
    }
    case "set-last-intent":
      return {
        ...state,
        lastIntent: action.intent
      };
    case "update-selected-rects": {
      if (state.selectedComponents.length === 0 || action.rects.length === 0) {
        return state;
      }

      let changed = false;
      const rectById = new Map(action.rects.map((item) => [item.id, item.rect]));
      const nextSelection = state.selectedComponents.map((component) => {
        const nextRect = rectById.get(component.id);
        if (!nextRect || isSameRect(component.rect, nextRect)) {
          return component;
        }

        changed = true;
        return {
          ...component,
          rect: nextRect
        };
      });

      if (!changed) {
        return state;
      }

      return {
        ...state,
        selectedComponents: nextSelection
      };
    }
    default:
      return state;
  }
}
