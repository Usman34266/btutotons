import { ChevronDown } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/cn";

/**
 * Native <select>: the platform picker on phones, works without JS, fully
 * accessible. Styled to match Input (D042).
 */
function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span className={cn("relative inline-flex w-full", className)}>
      <select
        data-slot="native-select"
        className="h-12 w-full min-w-0 appearance-none rounded-lg border border-input bg-surface pr-10 pl-3 text-base text-ink transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  );
}

export { NativeSelect };
