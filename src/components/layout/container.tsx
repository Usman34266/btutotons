import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

/** Max 1120px, 16px side gutter on mobile. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1120px] px-4 md:px-6", className)}
      {...props}
    />
  );
}
