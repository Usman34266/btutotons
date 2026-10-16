"use client";

import { Check, Copy, RotateCcw, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getContent } from "@/content";
import { copyText } from "@/lib/clipboard";
import { shareLink } from "@/lib/share";

const toast = () => import("sonner").then((m) => m.toast);

/** Copy result, share link, reset. Copy/share appear only with a valid result. */
export function ResultActions({
  copyValue,
  shareText,
  onReset,
  showReset,
}: {
  copyValue: string | null;
  shareText: string;
  onReset(): void;
  showReset: boolean;
}) {
  const copy = getContent().home.actions;
  const [copied, setCopied] = useState(false);

  if (!copyValue && !showReset) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {copyValue && (
        <>
          <Button
            variant="outline"
            onClick={async () => {
              if (await copyText(copyValue)) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2_000);
                (await toast()).success(copy.copied);
              } else {
                (await toast()).error(copy.copyFailed);
              }
            }}
          >
            {copied ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {copied ? copy.copied : copy.copy}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const outcome = await shareLink({
                title: copy.shareTitle,
                text: shareText,
                url: window.location.href,
              });
              if (outcome === "copied")
                (await toast()).success(copy.linkCopied);
              if (outcome === "failed") (await toast()).error(copy.copyFailed);
            }}
          >
            <Share2 aria-hidden="true" />
            {copy.share}
          </Button>
        </>
      )}
      {showReset && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-ink hover:bg-accent/10"
        >
          <RotateCcw aria-hidden="true" />
          {copy.reset}
        </Button>
      )}
    </div>
  );
}
