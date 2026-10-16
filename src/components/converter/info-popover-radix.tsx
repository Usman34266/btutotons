"use client";

import type { ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { InfoTrigger } from "./info-trigger";

export default function RadixInfoPopover({
  label,
  icon,
  children,
  className,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <InfoTrigger label={label} className={className}>
          {icon}
        </InfoTrigger>
      </PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  );
}
