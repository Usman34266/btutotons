/**
 * Writes public/ga.js, the Google Analytics 4 loader (D120). Runs at prebuild.
 *
 * A first-party file instead of next/script: it adds nothing to the React
 * bundle (D097 budget) and needs no inline script. It runs only on the
 * production host, so local runs, CI and previews send no hits, and never on
 * /embed/, which other sites frame. Google's script loads after the page does.
 *
 * The URL fragment holds the values people type and must never reach Google.
 * page_location leaves it out, and each form gets a fragment-free action before
 * GA reads it: GA's automatic form events report form.action as form_destination,
 * and a form with no action reports the full URL. These listeners are added
 * before Google's script loads, so they run first.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { site } from "../src/config/site";

const out = resolve(import.meta.dirname, "../public/ga.js");
const id = site.googleAnalyticsId;

if (!id) {
  rmSync(out, { force: true });
} else {
  const { hostname } = new URL(site.url);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    `(function () {
  if (location.hostname !== ${JSON.stringify(hostname)}) return;
  if (location.pathname.indexOf("/embed") === 0) return;
  function cleanForm(e) {
    var form = e.target && e.target.closest && e.target.closest("form");
    if (form) form.setAttribute("action", location.pathname);
  }
  ["focusin", "input", "change", "submit"].forEach(function (type) {
    document.addEventListener(type, cleanForm, true);
  });
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag("js", new Date());
  gtag("config", ${JSON.stringify(id)}, {
    page_location: location.origin + location.pathname,
  });
  function load() {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=${id}";
    document.head.appendChild(s);
  }
  if (document.readyState === "complete") load();
  else addEventListener("load", load);
})();
`,
  );
}
