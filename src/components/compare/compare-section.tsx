"use client";

import { ChevronDown, ListOrdered } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { getContent } from "@/content";
import { cn } from "@/lib/cn";
import { COMPARE_ANCHOR, routes } from "@/registry/routes";

const ComparePanel = dynamic(
  () => import("./compare-panel").then((m) => m.ComparePanel),
  { loading: () => <div className="min-h-80" /> },
);

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const isCompareHash = () => window.location.hash === `#${COMPARE_ANCHOR}`;
const getFalse = () => false;

/** "Compare two ratings" (collapsed, loads on open) and the link to the list tool. */
export function CompareSection() {
  const copy = getContent().home.tools;
  const panelId = useId();
  const [open, setOpen] = useState(false);

  // Arriving at (or following a link to) /#compare opens the panel.
  const atCompare = useSyncExternalStore(
    subscribeHash,
    isCompareHash,
    getFalse,
  );
  const [wasAtCompare, setWasAtCompare] = useState(false);
  if (atCompare !== wasAtCompare) {
    setWasAtCompare(atCompare);
    if (atCompare) setOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="group"
        >
          {copy.compare}
          <ChevronDown
            aria-hidden="true"
            className="transition-transform duration-150 group-aria-expanded:rotate-180"
          />
        </Button>
        <Link
          href={routes.batch.path}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <ListOrdered aria-hidden="true" />
          {copy.batch}
        </Link>
      </div>
      <div id={panelId} hidden={!open}>
        {open && <ComparePanel />}
      </div>
    </div>
  );
}
