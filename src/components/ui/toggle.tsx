"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/cn";

const toggleVariants = cva(
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md px-3 text-base font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 hover:text-ink disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-surface data-[state=on]:text-ink data-[state=on]:shadow-[inset_0_0_0_1.5px_var(--accent)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Toggle({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
