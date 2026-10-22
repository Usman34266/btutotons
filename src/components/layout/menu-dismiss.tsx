"use client";

import { useEffect } from "react";

/** Closes the header's <details> menu on a link click, an outside click or Escape. */
export function MenuDismiss({ id }: { id: string }) {
  useEffect(() => {
    const menu = document.getElementById(id);
    if (!(menu instanceof HTMLDetailsElement)) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (
        !(target instanceof Element) ||
        !menu.contains(target) ||
        target.closest("a")
      )
        menu.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !menu.open) return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [id]);
  return null;
}
