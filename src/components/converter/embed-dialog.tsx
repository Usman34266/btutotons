"use client";

import { Check, Copy } from "lucide-react";
import { useId, useState, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUiContent } from "@/content/ui";
import { copyText } from "@/lib/clipboard";
import { embedCode } from "@/lib/embed";

const toast = () => import("sonner").then((m) => m.toast);

/** "Embed this calculator": the iframe snippet and a copy button. Loaded on first open. */
export default function EmbedDialog({
  open,
  onOpenChange,
  returnFocus,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  /** The button that opened it; it isn't a Radix trigger, so focus goes back by hand. */
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const copy = getUiContent().home.actions.embedDialog;
  const [copied, setCopied] = useState(false);
  const codeId = useId();
  const code = embedCode();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={copy.close}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <DialogTitle className="pr-10 text-xl font-semibold">
          {copy.title}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          {copy.body}
        </DialogDescription>
        <div className="flex flex-col gap-1">
          <span id={codeId} className="text-label text-ink">
            {copy.codeLabel}
          </span>
          <pre
            aria-labelledby={codeId}
            tabIndex={0}
            data-testid="embed-code"
            className="overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-sm break-all whitespace-pre-wrap"
          >
            <code>{code}</code>
          </pre>
        </div>
        <Button
          variant="outline"
          className="self-end"
          onClick={async () => {
            if (await copyText(code)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2_000);
              (await toast()).success(copy.codeCopied);
            } else {
              (await toast()).error(copy.copyFailed);
            }
          }}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? copy.codeCopied : copy.copyCode}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
