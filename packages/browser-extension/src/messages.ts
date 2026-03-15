import type { SupportedLocale } from "@ai-ui-runtime/shared";

export const MESSAGE_TYPES = {
  popupGetTabState: "aiui/popup/get-tab-state",
  popupEnableTab: "aiui/popup/enable-tab",
  popupDisableTab: "aiui/popup/disable-tab",
  popupSetLocale: "aiui/popup/set-locale",
  overlayDisableSelf: "aiui/overlay/disable-self",
  contentActivate: "aiui/content/activate",
  contentDeactivate: "aiui/content/deactivate",
  contentUpdateLocale: "aiui/content/update-locale",
  contentGetStatus: "aiui/content/get-status"
} as const;

export type TabDebugState = {
  tabId: number;
  url: string;
  host: string;
  enabled: boolean;
  locale: SupportedLocale;
  isSupportedUrl: boolean;
};

export type PopupGetTabStateRequest = {
  type: typeof MESSAGE_TYPES.popupGetTabState;
  tabId: number;
  url: string;
};

export type PopupEnableTabRequest = {
  type: typeof MESSAGE_TYPES.popupEnableTab;
  tabId: number;
  url: string;
};

export type PopupDisableTabRequest = {
  type: typeof MESSAGE_TYPES.popupDisableTab;
  tabId: number;
  url: string;
};

export type PopupSetLocaleRequest = {
  type: typeof MESSAGE_TYPES.popupSetLocale;
  tabId: number;
  url: string;
  locale: SupportedLocale;
};

export type OverlayDisableSelfRequest = {
  type: typeof MESSAGE_TYPES.overlayDisableSelf;
};

export type ContentActivateCommand = {
  type: typeof MESSAGE_TYPES.contentActivate;
  payload: {
    locale: SupportedLocale;
  };
};

export type ContentDeactivateCommand = {
  type: typeof MESSAGE_TYPES.contentDeactivate;
};

export type ContentUpdateLocaleCommand = {
  type: typeof MESSAGE_TYPES.contentUpdateLocale;
  payload: {
    locale: SupportedLocale;
  };
};

export type ContentGetStatusCommand = {
  type: typeof MESSAGE_TYPES.contentGetStatus;
};

export type PopupRequest =
  | PopupDisableTabRequest
  | PopupEnableTabRequest
  | PopupGetTabStateRequest
  | PopupSetLocaleRequest;

export type ContentCommand =
  | ContentActivateCommand
  | ContentDeactivateCommand
  | ContentGetStatusCommand
  | ContentUpdateLocaleCommand;

export type RuntimeRequest = ContentCommand | OverlayDisableSelfRequest | PopupRequest;

export type RuntimeResponse = {
  ok: boolean;
  error?: string;
  state?: TabDebugState;
  locale?: SupportedLocale;
  active?: boolean;
};
