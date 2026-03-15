import type { SupportedLocale } from "@ai-ui-runtime/shared";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { OverlayApp } from "./OverlayApp";

export const OVERLAY_HOST_ID = "ai-ui-runtime-overlay-host";

export type OverlayRenderProps = {
  locale: SupportedLocale;
  onExit: () => void;
};

export type MountOverlayOptions = OverlayRenderProps & {
  cssText: string;
};

export type MountedOverlay = {
  host: HTMLElement;
  root: Root;
  update: (props: OverlayRenderProps) => void;
  unmount: () => void;
};

export function mountOverlay(options: MountOverlayOptions): MountedOverlay {
  const existingHost = document.getElementById(OVERLAY_HOST_ID);
  if (existingHost instanceof HTMLElement) {
    throw new Error("[AI UI Runtime] 覆盖层宿主节点已存在");
  }

  const host = document.createElement("div");
  host.id = OVERLAY_HOST_ID;
  host.dataset.aiUiRuntimeIgnore = "true";
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.pointerEvents = "none";
  host.style.zIndex = "2147483647";

  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = options.cssText;

  const mountNode = document.createElement("div");
  shadowRoot.append(style, mountNode);
  document.documentElement.appendChild(host);

  const root = createRoot(mountNode);

  const render = (props: OverlayRenderProps) => {
    root.render(<OverlayApp locale={props.locale} onExit={props.onExit} overlayHost={host} />);
  };

  render({
    locale: options.locale,
    onExit: options.onExit
  });

  return {
    host,
    root,
    update(props) {
      render(props);
    },
    unmount() {
      root.unmount();
      host.remove();
    }
  };
}
