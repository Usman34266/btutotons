import { site } from "@/config/site";
import { getUiContent } from "@/content/ui";
import { routes } from "@/registry/routes";

/** The iframe snippet other sites paste. Inline styles only: no colors, so it suits any host page. */
export function embedCode(): string {
  const { frameTitle, credit } = getUiContent().home.actions.embedDialog;
  const src = new URL(routes.embed.path, site.url).href;
  const home = new URL(routes.home.path, site.url).href;
  return [
    `<iframe src="${src}" title="${frameTitle}" width="100%" height="720" style="border:0;max-width:960px" loading="lazy"></iframe>`,
    `<p style="font-size:12px">${credit} <a href="${home}" target="_blank" rel="noopener">${site.name}</a></p>`,
  ].join("\n");
}
