import { normalizeLocale } from "@ai-ui-runtime/shared";
import type { SupportedLocale } from "@ai-ui-runtime/shared";
import overlayCss from "./overlay/overlay.css";
import { mountOverlay } from "./overlay/mountOverlay";
import type { MountedOverlay, OverlayRenderProps } from "./overlay/mountOverlay";
import { MESSAGE_TYPES } from "./messages";
import type { RuntimeRequest, RuntimeResponse } from "./messages";

type RuntimeController = {
  activate: (locale: SupportedLocale) => void;
  deactivate: () => void;
  getStatus: () => {
    active: boolean;
    locale: SupportedLocale;
  };
  updateLocale: (locale: SupportedLocale) => void;
};

declare global {
  interface Window {
    __AI_UI_RUNTIME_BOOTED__?: boolean;
    __AI_UI_RUNTIME_CONTROLLER__?: RuntimeController;
  }
}

function createController(): RuntimeController {
  let mountedOverlay: MountedOverlay | null = null;
  let currentLocale = normalizeLocale(navigator.language);

  const renderOverlay = (props: OverlayRenderProps) => {
    if (mountedOverlay) {
      mountedOverlay.update(props);
      return;
    }

    mountedOverlay = mountOverlay({
      cssText: overlayCss,
      ...props
    });
  };

  const handleExit = () => {
    controller.deactivate();
    void chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.overlayDisableSelf
    });
  };

  const controller: RuntimeController = {
    activate(locale) {
      currentLocale = normalizeLocale(locale);
      renderOverlay({
        locale: currentLocale,
        onExit: handleExit
      });
    },
    deactivate() {
      mountedOverlay?.unmount();
      mountedOverlay = null;
    },
    getStatus() {
      return {
        active: mountedOverlay !== null,
        locale: currentLocale
      };
    },
    updateLocale(locale) {
      currentLocale = normalizeLocale(locale);
      if (mountedOverlay) {
        mountedOverlay.update({
          locale: currentLocale,
          onExit: handleExit
        });
      }
    }
  };

  return controller;
}

function bootController() {
  if (window.__AI_UI_RUNTIME_BOOTED__) {
    return;
  }

  const controller = createController();
  window.__AI_UI_RUNTIME_CONTROLLER__ = controller;

  chrome.runtime.onMessage.addListener((message: RuntimeRequest, _sender, sendResponse) => {
    let response: RuntimeResponse = {
      ok: true
    };

    switch (message.type) {
      case MESSAGE_TYPES.contentActivate:
        controller.activate(message.payload.locale);
        response = {
          ok: true,
          active: true,
          locale: controller.getStatus().locale
        };
        break;
      case MESSAGE_TYPES.contentDeactivate:
        controller.deactivate();
        response = {
          ok: true,
          active: false,
          locale: controller.getStatus().locale
        };
        break;
      case MESSAGE_TYPES.contentUpdateLocale:
        controller.updateLocale(message.payload.locale);
        response = {
          ok: true,
          active: controller.getStatus().active,
          locale: controller.getStatus().locale
        };
        break;
      case MESSAGE_TYPES.contentGetStatus:
        response = {
          ok: true,
          active: controller.getStatus().active,
          locale: controller.getStatus().locale
        };
        break;
      default:
        return false;
    }

    sendResponse(response);
    return true;
  });

  window.__AI_UI_RUNTIME_BOOTED__ = true;
  console.info("[AI UI Runtime] Content runtime ready and awaiting explicit activation");
}

bootController();
