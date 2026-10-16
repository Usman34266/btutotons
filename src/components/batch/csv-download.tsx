"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getUiContent } from "@/content/ui";
import { toCsv, type BatchRow, type CapacityUnitId } from "@/engine";
import { analytics } from "@/lib/analytics";

/** Builds the CSV in the browser and saves it; nothing is uploaded. */
export function CsvDownload({
  rows,
  unit,
}: {
  rows: readonly BatchRow[];
  unit: CapacityUnitId;
}) {
  const copy = getUiContent().batch.form;
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        const blob = new Blob([toCsv(rows, unit)], {
          type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = copy.fileName;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        analytics.track("batch_exported", { mode: "batch", unit });
      }}
    >
      <Download aria-hidden="true" />
      {copy.download}
    </Button>
  );
}
