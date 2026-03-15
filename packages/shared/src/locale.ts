export const supportedLocales = ["zh-CN", "en-US"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export function normalizeLocale(input?: string | null): SupportedLocale {
  if (!input) {
    return "zh-CN";
  }

  const normalized = input.toLowerCase();
  if (normalized.startsWith("zh")) {
    return "zh-CN";
  }

  return "en-US";
}
