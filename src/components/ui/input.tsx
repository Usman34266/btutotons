import type * as React from "react";

import { cn } from "@/lib/cn";

// 16px text (no iOS zoom), 48px tall, 3:1 outline. Error state via aria-invalid.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-lg border border-input bg-surface px-3 text-base text-ink transition-colors duration-150 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:shadow-[inset_0_0_0_1px_var(--danger)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
