import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { getContent } from "@/content";
import { breadcrumbTrail, type RouteId } from "@/registry/routes";

/** Trail from the registry; the current page is text, not a link. */
export function PageBreadcrumb({ route }: { route: RouteId }) {
  const { common, routes } = getContent();
  const trail = breadcrumbTrail(route);
  return (
    <nav aria-label={common.breadcrumb}>
      <ol className="flex flex-wrap items-center gap-x-1 text-label text-muted-foreground">
        {trail.map((r, i) => {
          const name = routes[r.id].breadcrumb;
          const last = i === trail.length - 1;
          return (
            <li key={r.id} className="inline-flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {name}
                </span>
              ) : (
                <>
                  <Link
                    href={r.path}
                    className="-mx-1 inline-flex min-h-11 items-center rounded px-1 text-ink underline underline-offset-4 hover:text-accent"
                  >
                    {name}
                  </Link>
                  <ChevronRight aria-hidden="true" className="size-4" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
