import type * as React from "react";

import { cn } from "@/lib/cn";

// Same outline, text size and error state as Input.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-48 w-full min-w-0 rounded-lg border border-input bg-surface px-3 py-2.5 text-base text-ink transition-colors duration-150 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:shadow-[inset_0_0_0_1px_var(--danger)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
