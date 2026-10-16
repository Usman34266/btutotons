"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";

/**
 * Small explanation behind an icon button. A popover, not a hover tooltip:
 * keyboard (Enter/Space, Escape) and touch work. 44px hit area.
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full align-middle text-muted-foreground transition-colors duration-150 after:absolute after:-inset-2.5 after:content-[''] hover:text-ink data-[state=open]:text-accent",
            className,
          )}
        >
          {icon}
        </button>
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  );
}
