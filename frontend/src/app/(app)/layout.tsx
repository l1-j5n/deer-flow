import { ClientProviders } from "@/components/client-providers";
import { detectLocaleServer } from "@/core/i18n/server";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await detectLocaleServer();
  return (
    <ClientProviders initialLocale={locale}>{children}</ClientProviders>
  );
}
