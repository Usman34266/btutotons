"use client";

import { lazy, Suspense, useRef, type ReactNode } from "react";

import { useNearViewport } from "./use-near-viewport";

const TonnagePlayground = lazy(() => import("./tonnage-playground"));

/**
 * Shows the server-rendered static card until the section is near the
 * viewport, then swaps in the interactive version. Motion stays out of the
 * initial bundle (D097 budget).
 */
export function TonnagePlaygroundLoader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);

  return (
    <div ref={ref}>
      {near ? (
        <Suspense fallback={children}>
          <TonnagePlayground />
        </Suspense>
      ) : (
        children
      )}
    </div>
  );
}
