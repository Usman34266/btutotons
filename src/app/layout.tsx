import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { plexMono, plexSans } from "@/config/fonts";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={site.locale}
      className={cn(plexSans.variable, plexMono.variable, "antialiased")}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
