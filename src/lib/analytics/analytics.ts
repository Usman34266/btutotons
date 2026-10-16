import type { CapacityUnitId, ParseErrorCode } from "@/engine";

export type AnalyticsEvent =
  | "valid_conversion"
  | "preset_selected"
  | "compare_completed"
  | "batch_exported"
  | "sizing_completed"
  | "size_class_shown";

/**
 * Event props: mode, unit, error code and route only. There is deliberately
 * no field that could carry a user-entered value.
 */
export interface AnalyticsProps {
  mode?: "to-tons" | "to-btuh" | "compare" | "batch";
  unit?: CapacityUnitId;
  errorCode?: ParseErrorCode;
  route?: string;
}

export interface Analytics {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
}
