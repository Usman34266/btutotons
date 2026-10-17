import { Logo } from "@/components/layout/logo";
import { site } from "@/config/site";

/** Logo and site address at the top of a printout; hidden on screen (D110). */
export function PrintBrand() {
  return (
    <div className="hidden items-center justify-between gap-4 border-b border-border pb-3 text-lg font-semibold text-ink print:flex">
      <Logo />
      <a href={site.url} className="text-base font-medium text-ink">
        {new URL(site.url).host}
      </a>
    </div>
  );
}
