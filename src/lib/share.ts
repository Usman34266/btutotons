import { copyText } from "./clipboard";

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/** Native share sheet where available, otherwise copy the link. */
export async function shareLink(data: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareOutcome> {
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return "cancelled";
      // Fall through to copying (e.g. NotAllowedError on desktop).
    }
  }
  return (await copyText(data.url)) ? "copied" : "failed";
}
