import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

/** Icon button that opens an InfoPopover. 44px hit area. */
export function InfoTrigger({
  label,
  className,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      className={cn(
        "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full align-middle text-muted-foreground transition-colors duration-150 after:absolute after:-inset-2.5 after:content-[''] hover:text-ink data-[state=open]:text-accent",
        className,
      )}
      {...props}
    />
  );
}
