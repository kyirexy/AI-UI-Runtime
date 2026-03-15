import { normalizeLocale, supportedLocales } from "@ai-ui-runtime/shared";
import type { SupportedLocale } from "@ai-ui-runtime/shared";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { getExtensionStrings } from "../i18n";
import { MESSAGE_TYPES } from "../messages";
import type { RuntimeResponse, TabDebugState } from "../messages";

type PopupViewState = {
  error: string | null;
  isBusy: boolean;
  tabState: TabDebugState | null;
};

function sendMessage<T extends RuntimeResponse>(message: object): Promise<T> {
  return chrome.runtime.sendMessage(message);
}

async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tab ?? null;
}

export function PopupApp(): JSX.Element {
  const [locale, setLocale] = useState<SupportedLocale>(normalizeLocale(chrome.i18n.getUILanguage()));
  const [viewState, setViewState] = useState<PopupViewState>({
    error: null,
    isBusy: true,
    tabState: null
  });
  const strings = getExtensionStrings(locale);

  async function refreshState() {
    const tab = await getCurrentTab();
    if (!tab?.id) {
      setViewState({
        error: strings.popup.noActiveTab,
        isBusy: false,
        tabState: null
      });
      return;
    }

    const response = await sendMessage<RuntimeResponse>({
      type: MESSAGE_TYPES.popupGetTabState,
      tabId: tab.id,
      url: tab.url ?? ""
    });

    if (!response.ok || !response.state) {
      setViewState({
        error: response.error ?? strings.popup.readStateError,
        isBusy: false,
        tabState: null
      });
      return;
    }

    setLocale(response.state.locale);
    setViewState({
      error: null,
      isBusy: false,
      tabState: response.state
    });
  }

  useEffect(() => {
    void refreshState();
  }, []);

  async function handleEnable() {
    const tabState = viewState.tabState;
    if (!tabState) {
      return;
    }

    setViewState((current) => ({
      ...current,
      isBusy: true
    }));

    const response = await sendMessage<RuntimeResponse>({
      type: MESSAGE_TYPES.popupEnableTab,
      tabId: tabState.tabId,
      url: tabState.url
    });

    setViewState({
      error: response.ok ? null : response.error ?? null,
      isBusy: false,
      tabState: response.state ?? tabState
    });

    if (response.ok) {
      window.setTimeout(() => window.close(), 80);
    }
  }

  async function handleDisable() {
    const tabState = viewState.tabState;
    if (!tabState) {
      return;
    }

    setViewState((current) => ({
      ...current,
      isBusy: true
    }));

    const response = await sendMessage<RuntimeResponse>({
      type: MESSAGE_TYPES.popupDisableTab,
      tabId: tabState.tabId,
      url: tabState.url
    });

    setViewState({
      error: response.ok ? null : response.error ?? null,
      isBusy: false,
      tabState: response.state ?? tabState
    });
  }

  async function handleLocaleChange(nextLocale: SupportedLocale) {
    setLocale(nextLocale);

    const tabState = viewState.tabState;
    if (!tabState) {
      return;
    }

    const response = await sendMessage<RuntimeResponse>({
      type: MESSAGE_TYPES.popupSetLocale,
      tabId: tabState.tabId,
      url: tabState.url,
      locale: nextLocale
    });

    setViewState((current) => ({
      ...current,
      error: response.ok ? null : response.error ?? null,
      tabState: response.state ?? current.tabState
    }));
  }

  const currentState = viewState.tabState;
  const pageHost = currentState?.host || strings.popup.pageUnknown;

  return (
    <div className="popup-shell">
      <header className="popup-header">
        <div>
          <p className="popup-eyebrow">{strings.overlay.eyebrow}</p>
          <h1>{strings.popup.title}</h1>
        </div>
        {currentState ? (
          <span className={`popup-status-chip ${currentState.enabled ? "is-active" : "is-inactive"}`}>
            {currentState.enabled ? strings.popup.statusActive : strings.popup.statusInactive}
          </span>
        ) : null}
      </header>

      <p className="popup-subtitle">{strings.popup.subtitle}</p>

      <section className="popup-section">
        <p className="popup-label">{strings.popup.pageLabel}</p>
        <div className="popup-card">
          <strong>{pageHost}</strong>
          <span>
            {strings.popup.statusLabel}:{" "}
            {currentState?.enabled ? strings.popup.statusActive : strings.popup.statusInactive}
          </span>
        </div>
      </section>

      <section className="popup-section">
        <p className="popup-label">{strings.popup.localeLabel}</p>
        <div className="popup-locale-grid">
          {supportedLocales.map((item) => (
            <button
              key={item}
              type="button"
              className={`popup-locale-button ${locale === item ? "is-active" : ""}`}
              onClick={() => handleLocaleChange(item)}
            >
              {strings.localeNames[item]}
            </button>
          ))}
        </div>
      </section>

      {currentState?.isSupportedUrl === false ? <div className="popup-warning">{strings.popup.unsupportedPage}</div> : null}

      <section className="popup-section">
        {currentState?.enabled ? (
          <>
            <button className="popup-primary" type="button" disabled={viewState.isBusy} onClick={handleDisable}>
              {strings.popup.disableButton}
            </button>
            <p className="popup-hint">{strings.popup.enabledHint}</p>
          </>
        ) : (
          <>
            <button
              className="popup-primary"
              type="button"
              disabled={viewState.isBusy || !currentState || currentState.isSupportedUrl === false}
              onClick={handleEnable}
            >
              {strings.popup.enableButton}
            </button>
            <p className="popup-hint">{strings.popup.inactiveHint}</p>
          </>
        )}
      </section>

      <section className="popup-section">
        <p className="popup-label">{strings.popup.stepsTitle}</p>
        <ol className="popup-steps">
          {strings.popup.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {viewState.error ? <div className="popup-error">{viewState.error}</div> : null}

      <button className="popup-link" type="button" onClick={() => void refreshState()}>
        {strings.popup.refreshButton}
      </button>
    </div>
  );
}
