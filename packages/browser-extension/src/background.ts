import { normalizeLocale } from "@ai-ui-runtime/shared";
import type { SupportedLocale } from "@ai-ui-runtime/shared";
import { MESSAGE_TYPES } from "./messages";
import type { RuntimeRequest, RuntimeResponse, TabDebugState } from "./messages";

const SETTINGS_KEY = "aiui.settings";

type StoredSettings = {
  locale?: SupportedLocale;
};

type StoredTabState = {
  enabled: true;
};

function getTabStateKey(tabId: number): string {
  return `aiui.tab.${tabId}`;
}

function isSupportedUrl(url: string): boolean {
  return /^https?:\/\//.test(url) || /^file:\/\//.test(url);
}

function getHost(url: string): string {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

async function getPreferredLocale(): Promise<SupportedLocale> {
  const settings = (await chrome.storage.local.get(SETTINGS_KEY))[SETTINGS_KEY] as StoredSettings | undefined;
  return normalizeLocale(settings?.locale ?? chrome.i18n.getUILanguage());
}

async function setPreferredLocale(locale: SupportedLocale): Promise<void> {
  await chrome.storage.local.set({
    [SETTINGS_KEY]: {
      locale
    }
  });
}

async function getStoredTabState(tabId: number): Promise<StoredTabState | null> {
  const key = getTabStateKey(tabId);
  const result = (await chrome.storage.session.get(key))[key] as StoredTabState | undefined;
  return result ?? null;
}

async function setStoredTabState(tabId: number, state: StoredTabState): Promise<void> {
  await chrome.storage.session.set({
    [getTabStateKey(tabId)]: state
  });
}

async function clearStoredTabState(tabId: number): Promise<void> {
  await chrome.storage.session.remove(getTabStateKey(tabId));
}

async function buildTabDebugState(tabId: number, url: string): Promise<TabDebugState> {
  const storedState = await getStoredTabState(tabId);
  const locale = await getPreferredLocale();

  return {
    tabId,
    url,
    host: getHost(url),
    enabled: storedState?.enabled ?? false,
    locale,
    isSupportedUrl: isSupportedUrl(url)
  };
}

async function ensureContentScript(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });
}

async function sendContentCommand(tabId: number, message: RuntimeRequest): Promise<RuntimeResponse> {
  return chrome.tabs.sendMessage(tabId, message);
}

async function activateDebugOnTab(tabId: number, url: string): Promise<TabDebugState> {
  if (!isSupportedUrl(url)) {
    throw new Error("Unsupported page for overlay injection.");
  }

  const locale = await getPreferredLocale();
  await ensureContentScript(tabId);
  await sendContentCommand(tabId, {
    type: MESSAGE_TYPES.contentActivate,
    payload: {
      locale
    }
  });
  await setStoredTabState(tabId, { enabled: true });
  return buildTabDebugState(tabId, url);
}

async function deactivateDebugOnTab(tabId: number, url: string): Promise<TabDebugState> {
  try {
    await sendContentCommand(tabId, {
      type: MESSAGE_TYPES.contentDeactivate
    });
  } catch {
    // Ignore if the page is already unloaded.
  }

  await clearStoredTabState(tabId);
  return buildTabDebugState(tabId, url);
}

async function reattachIfNeeded(tabId: number, url: string): Promise<void> {
  const storedState = await getStoredTabState(tabId);
  if (!storedState?.enabled) {
    return;
  }

  if (!isSupportedUrl(url)) {
    await clearStoredTabState(tabId);
    return;
  }

  const locale = await getPreferredLocale();

  try {
    await ensureContentScript(tabId);
    await sendContentCommand(tabId, {
      type: MESSAGE_TYPES.contentActivate,
      payload: {
        locale
      }
    });
  } catch (error) {
    console.warn("[AI UI Runtime] Failed to reattach debug session", error);
  }
}

async function handleMessage(message: RuntimeRequest, sender: chrome.runtime.MessageSender): Promise<RuntimeResponse> {
  switch (message.type) {
    case MESSAGE_TYPES.popupGetTabState:
      return {
        ok: true,
        state: await buildTabDebugState(message.tabId, message.url)
      };
    case MESSAGE_TYPES.popupEnableTab:
      return {
        ok: true,
        state: await activateDebugOnTab(message.tabId, message.url)
      };
    case MESSAGE_TYPES.popupDisableTab:
      return {
        ok: true,
        state: await deactivateDebugOnTab(message.tabId, message.url)
      };
    case MESSAGE_TYPES.popupSetLocale:
      await setPreferredLocale(message.locale);

      if (message.tabId > 0 && message.url) {
        const storedState = await getStoredTabState(message.tabId);
        if (storedState?.enabled && isSupportedUrl(message.url)) {
          try {
            await sendContentCommand(message.tabId, {
              type: MESSAGE_TYPES.contentUpdateLocale,
              payload: {
                locale: message.locale
              }
            });
          } catch {
            await ensureContentScript(message.tabId);
            await sendContentCommand(message.tabId, {
              type: MESSAGE_TYPES.contentActivate,
              payload: {
                locale: message.locale
              }
            });
          }
        }
      }

      return {
        ok: true,
        locale: message.locale,
        state: await buildTabDebugState(message.tabId, message.url)
      };
    case MESSAGE_TYPES.overlayDisableSelf: {
      const tabId = sender.tab?.id;
      const url = sender.tab?.url ?? "";

      if (!tabId) {
        return {
          ok: false,
          error: "Missing tab context."
        };
      }

      return {
        ok: true,
        state: await deactivateDebugOnTab(tabId, url)
      };
    }
    default:
      return {
        ok: false,
        error: "Unknown message type."
      };
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const locale = await getPreferredLocale();
  console.info("[AI UI Runtime] Extension installed. Locale:", locale);
});

chrome.runtime.onMessage.addListener((message: RuntimeRequest, sender, sendResponse) => {
  void handleMessage(message, sender)
    .then((response) => sendResponse(response))
    .catch((error) => {
      console.error("[AI UI Runtime] Background message handling failed", error);
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown background error."
      });
    });

  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  void reattachIfNeeded(tabId, tab.url ?? "");
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void clearStoredTabState(tabId);
});
