import { site } from "@/config/site";
import { getUiContent } from "@/content/ui";

/** Site name and address at the top of a printed calculator; hidden on screen. */
export function PrintHeading() {
  return (
    <p className="hidden text-label print:block">
      {getUiContent().home.actions.printHeading(new URL(site.url).host)}
    </p>
  );
}
