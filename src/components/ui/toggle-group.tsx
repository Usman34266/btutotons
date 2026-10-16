"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type * as React from "react";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/cn";

/** Segmented control (e.g. precision 2 / 4 / 6). */
function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn(
        "inline-flex w-fit items-stretch gap-1 rounded-lg border border-border bg-muted p-1",
        className,
      )}
      {...props}
    />
  );
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants(), className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
