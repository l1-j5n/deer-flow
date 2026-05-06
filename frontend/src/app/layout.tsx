import "@/styles/globals.css";
import "katex/dist/katex.min.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "DeerFlow",
  description: "A LangChain-based framework for building super agents.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressContentEditableWarning suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
