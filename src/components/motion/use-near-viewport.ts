"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element comes within `margin` of the viewport, so a section's
 * animation code loads when it's seen and never on first paint. The default
 * is no margin: on a phone-sized first screen (Lighthouse's too) a margin
 * would pull below-the-fold code into the initial load.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  margin = "0px",
): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);

  return near;
}
