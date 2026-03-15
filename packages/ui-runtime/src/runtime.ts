import type { UIComponent } from "@ai-ui-runtime/shared";
import { inspectElement, scanVisibleComponents } from "./domScanner";

export class UIRuntime {
  scan(root?: ParentNode): UIComponent[] {
    return scanVisibleComponents(root);
  }

  inspect(element: Element | null): UIComponent | null {
    return inspectElement(element);
  }
}
