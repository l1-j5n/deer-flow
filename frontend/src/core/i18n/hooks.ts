"use client";

import { useEffect } from "react";

import { useI18nContext } from "./context";
import { getLocaleFromCookie, setLocaleInCookie } from "./cookies";
import { enUS } from "./locales/en-US";
import { zhCN } from "./locales/zh-CN";
import { jaJP } from "./locales/ja-JP";
import { koKR } from "./locales/ko-KR";
import { deDE } from "./locales/de-DE";
import { frFR } from "./locales/fr-FR";

import {
  DEFAULT_LOCALE,
  detectLocale,
  normalizeLocale,
  type Locale,
  type Translations,
} from "./index";

const translations: Record<Locale, Translations> = {
  "en-US": enUS,
  "zh-CN": zhCN,
  "ja-JP": jaJP,
  "ko-KR": koKR,
  "de-DE": deDE,
  "fr-FR": frFR,
};

// TranslationProxy supports both:
//   - Function call: t("agents.compare.title") or t("agents.compare.minutesAgo", {mins: "5"})
//   - Property access: t.agents.compare.title
//
// We intentionally use `any` in the index signature to bypass TypeScript's
// strict null checks (noUncheckedIndexedAccess) while keeping full runtime
// safety via the Proxy.  This is the cleanest way to support the dual
// t.key and t("key") usage patterns across the entire codebase.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTranslationProxy = TranslationProxy | any;

interface TranslationProxy {
  (key: string, params?: Record<string, string>): string;
  [key: string]: AnyTranslationProxy;
}

function createTranslationProxy(
  tx: Translations,
  path: string[] = [],
): TranslationProxy {
  const resolve = (key: string, params?: Record<string, string>): string => {
    const parts = key.split(".");
    let value: unknown = tx;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    if (typeof value !== "string") return key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\{${k}\}`, "g"), v),
      value,
    );
  };

  return new Proxy(resolve as TranslationProxy, {
    get(_target, prop) {
      if (typeof prop !== "string") return createTranslationProxy(tx, path);
      const newPath = [...path, prop];
      let value: unknown = tx;
      for (const part of newPath) {
        if (value && typeof value === "object" && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          return createTranslationProxy(tx, path);
        }
      }
      if (typeof value === "string") {
        // Return a callable that also acts as a string-like proxy
        const strProxy = new Proxy(
          ((_: string, __?: Record<string, string>) => value) as TranslationProxy,
          {
            get(___, p) {
              if (typeof p !== "string") return strProxy;
              return createTranslationProxy(tx, [...newPath, p]);
            },
          },
        );
        return strProxy;
      }
      if (value && typeof value === "object") {
        return createTranslationProxy(tx, newPath);
      }
      return createTranslationProxy(tx, path);
    },
  });
}

export function useI18n() {
  const { locale, setLocale } = useI18nContext();

  const tx = translations[locale] ?? translations[DEFAULT_LOCALE];

  const t = createTranslationProxy(tx);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleInCookie(newLocale);
  };

  // Initialize locale on mount
  useEffect(() => {
    const saved = getLocaleFromCookie();
    if (saved) {
      const normalizedSaved = normalizeLocale(saved);
      setLocale(normalizedSaved);
      if (saved !== normalizedSaved) {
        setLocaleInCookie(normalizedSaved);
      }
      return;
    }

    const detected = detectLocale();
    setLocale(detected);
    setLocaleInCookie(detected);
  }, [setLocale]);

  return {
    locale,
    t,
    changeLocale,
  };
}
