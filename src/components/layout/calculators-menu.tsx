import {
  Building2,
  ChevronDown,
  Cog,
  Gauge,
  Snowflake,
  Table,
  Thermometer,
  Timer,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { getContent } from "@/content";
import { calculatorGroups, type CalculatorIcon } from "@/lib/calculator-menu";
import { CHART_ANCHOR, routes } from "@/registry/routes";

import { Container } from "./container";
import { MenuDismiss } from "./menu-dismiss";

/** No lightning bolts: cooling kW and watts are not electricity (D115). */
const ICON: Record<CalculatorIcon, LucideIcon> = {
  tons: Snowflake,
  time: Timer,
  list: Table,
  kw: Gauge,
  watts: Thermometer,
  mbh: Building2,
  hp: Cog,
};

const MENU_ID = "calculators-menu";
const ITEM =
  "flex min-h-11 items-center gap-3 rounded-lg px-2 text-ink hover:bg-muted";

/**
 * Header menu of every calculator (D115). A server-rendered <details>, so the
 * links and icons ship no JS; MenuDismiss only closes it. Below `sm` it also
 * holds Chart and Guides, which the header hides there.
 */
export function CalculatorsMenu() {
  const { nav } = getContent().common;
  const groups = calculatorGroups();
  return (
    <details id={MENU_ID} className="group">
      <MenuDismiss id={MENU_ID} />
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg px-2 text-ink hover:bg-muted sm:px-3 [&::-webkit-details-marker]:hidden">
        <span className="sm:hidden">{nav.menu}</span>
        <span className="hidden sm:inline">{nav.calculators}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-border bg-surface shadow-card">
        <Container className="grid gap-6 py-4 sm:grid-cols-3 sm:py-6">
          {groups.map((g) => (
            <section key={g.id} aria-labelledby={`${MENU_ID}-${g.id}`}>
              <p
                id={`${MENU_ID}-${g.id}`}
                className="mb-1 px-2 text-label text-muted-foreground"
              >
                {g.heading}
              </p>
              <ul>
                {g.links.map((l) => {
                  const Icon = ICON[l.icon];
                  return (
                    <li key={l.href}>
                      <Link href={l.href} className={ITEM}>
                        <Icon
                          aria-hidden="true"
                          className="size-5 shrink-0 text-accent"
                        />
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <ul className="border-t border-border pt-4 sm:hidden">
            <li>
              <Link
                href={`${routes.home.path}#${CHART_ANCHOR}`}
                className={ITEM}
              >
                {nav.chart}
              </Link>
            </li>
            <li>
              <Link href={routes.nameplate.path} className={ITEM}>
                {nav.guides}
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </details>
  );
}
