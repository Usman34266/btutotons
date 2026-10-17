import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { plexMono, plexSans } from "@/config/fonts";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { cn } from "@/lib/cn";
import { colorTokens } from "@/lib/design-tokens";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  // Files written to public/ by scripts/generate-brand-assets.tsx (D109).
  // sizes="32x32" on the ICO keeps Chrome on the SVG.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: (["light", "dark"] as const).map((theme) => ({
    media: `(prefers-color-scheme: ${theme})`,
    color: colorTokens(theme).bg!,
  })),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={site.locale}
      className={cn(plexSans.variable, plexMono.variable, "antialiased")}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only rounded-lg bg-surface px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
        >
          {getContent().common.skipToContent}
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
