"use client";

import { Check, Code, Copy, Printer, RotateCcw, Share2 } from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getUiContent } from "@/content/ui";
import { copyText } from "@/lib/clipboard";
import { shareLink } from "@/lib/share";

const toast = () => import("sonner").then((m) => m.toast);
const EmbedDialog = lazy(() => import("./embed-dialog"));

/**
 * Copy result, share link, print, embed, reset. Copy, share and print appear
 * only with a valid result; embed always (D106). `tools={false}` drops print
 * and embed (the embed page itself).
 */
export function ResultActions({
  copyValue,
  shareText,
  onReset,
  showReset,
  tools = true,
}: {
  copyValue: string | null;
  shareText: string;
  onReset(): void;
  showReset: boolean;
  tools?: boolean;
}) {
  const copy = getUiContent().home.actions;
  const [copied, setCopied] = useState(false);
  /** null until first opened, so the dialog chunk loads on demand. */
  const [embedOpen, setEmbedOpen] = useState<boolean | null>(null);
  const embedButton = useRef<HTMLButtonElement>(null);

  if (!copyValue && !showReset && !tools) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1 print:hidden">
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
          {tools && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              {copy.print}
            </Button>
          )}
        </>
      )}
      {tools && (
        <Button
          ref={embedButton}
          variant="outline"
          onClick={() => setEmbedOpen(true)}
        >
          <Code aria-hidden="true" />
          {copy.embed}
        </Button>
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
      {embedOpen !== null && (
        <Suspense fallback={null}>
          <EmbedDialog
            open={embedOpen}
            onOpenChange={setEmbedOpen}
            returnFocus={embedButton}
          />
        </Suspense>
      )}
    </div>
  );
}
