"use client";

import { Info } from "lucide-react";
import { lazy, type ReactNode, Suspense, useEffect, useState } from "react";

import { InfoTrigger } from "./info-trigger";

let radix: Promise<typeof import("./info-popover-radix")> | undefined;
const loadRadix = () => (radix ??= import("./info-popover-radix"));
const RadixInfoPopover = lazy(loadRadix);

/** Fetches the popover code once the page has loaded and the main thread is free. */
function usePrefetchAfterLoad() {
  useEffect(() => {
    const idle = () =>
      "requestIdleCallback" in window
        ? requestIdleCallback(() => void loadRadix())
        : setTimeout(() => void loadRadix(), 200);
    if (document.readyState === "complete") {
      idle();
      return;
    }
    window.addEventListener("load", idle, { once: true });
    return () => window.removeEventListener("load", idle);
  }, []);
}

/**
 * Small explanation behind an icon button. A popover, not a hover tooltip:
 * keyboard (Enter/Space, Escape) and touch work. The popover code (Radix,
 * ~23 KB gzipped) stays out of the initial bundle: a plain trigger renders
 * first and the first click mounts the Radix popover already open.
 */
export function InfoPopover({
  label,
  icon = <Info aria-hidden="true" className="size-5" />,
  children,
  className,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  usePrefetchAfterLoad();

  const plain = (
    <InfoTrigger
      label={label}
      className={className}
      aria-expanded={false}
      data-state="closed"
      onClick={() => setArmed(true)}
    >
      {icon}
    </InfoTrigger>
  );

  if (!armed) return plain;
  return (
    <Suspense fallback={plain}>
      <RadixInfoPopover label={label} icon={icon} className={className}>
        {children}
      </RadixInfoPopover>
    </Suspense>
  );
}
