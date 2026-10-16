import type { Metadata } from "next";

import { Gallery } from "./gallery";

// Dev-only route (pageExtensions "dev.tsx" under `next dev`); never exported.
export const metadata: Metadata = {
  title: "Components | dev",
  robots: { index: false, follow: false },
};

export default function ComponentsPage() {
  return <Gallery />;
}
