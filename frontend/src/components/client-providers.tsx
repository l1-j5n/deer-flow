"use client";

import { I18nProvider } from "@/core/i18n/context";
import type { Locale } from "@/core/i18n";

export function ClientProviders({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
  );
}
