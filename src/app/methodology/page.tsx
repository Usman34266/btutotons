import {
  PROSE_LINK,
  ProsePage,
  ProseSection,
} from "@/components/layout/prose-page";
import { site } from "@/config/site";
import { getContent } from "@/content";
import {
  BTUH_PER_TON,
  CAPACITY_UNIT_IDS,
  ENGINE_VERSION,
  J_PER_BTU,
  MAX_INPUT_VALUE,
  UNITS,
  W_PER_BTUH,
  capacity,
  convertCapacity,
  formatConstant,
  formatInputValue,
  formatNumber,
  formatRatioPercent,
} from "@/engine";
import { formatDate } from "@/lib/date";
import { pageMetadata } from "@/lib/metadata";
import { SIZE_CLASS_BAND, US_SIZE_CLASS_TONS } from "@/registry/size-classes";

export const metadata = pageMetadata("methodology");

const TABLE = "w-full border-collapse text-left";
const CELL = "border-b border-border px-2 py-2 align-top sm:px-3";

function Table({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly string[];
  /** [row header, value, optional note shown under the value]. */
  rows: readonly (readonly [string, string, string?])[];
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="max-w-3xl overflow-x-auto rounded-xl border border-border bg-surface"
    >
      <table className={TABLE}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className={`${CELL} text-label`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([head, value, note], r) => (
            <tr key={r}>
              <th scope="row" className={`${CELL} font-medium`}>
                {head}
              </th>
              <td className={`${CELL} tabular-nums`}>
                {value}
                {note && (
                  <span className="block text-label text-muted-foreground">
                    {note}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MethodologyPage() {
  const { methodology: m } = getContent();
  const tonKw = convertCapacity(capacity(1, "tr")).coolingKw;
  const constantRows = [
    m.constants.rows.ton(formatConstant(BTUH_PER_TON)),
    m.constants.rows.btu(formatConstant(J_PER_BTU)),
    m.constants.rows.watt(formatConstant(W_PER_BTUH)),
    m.constants.rows.tonKw(formatNumber(tonKw, { precision: 6 })),
  ];
  const unitRows = CAPACITY_UNIT_IDS.map((id) => {
    const { label, toBase } = UNITS[id];
    const steps = toBase
      .map(([op, n]) => `${op} ${formatConstant(n)}`)
      .join(" ");
    return [label, steps || m.formulas.sameUnit] as const;
  });

  return (
    <ProsePage route="methodology" h1={m.h1} lead={m.opening}>
      <div className="flex flex-col gap-10 pt-4">
        <section aria-labelledby="constants" className="flex flex-col gap-3">
          <h2 id="constants">{m.constants.heading}</h2>
          <Table
            caption={m.constants.heading}
            columns={m.constants.columns}
            rows={constantRows}
          />
          <p className="max-w-prose">{m.constants.note}</p>
        </section>

        <section aria-labelledby="formulas" className="flex flex-col gap-3">
          <h2 id="formulas">{m.formulas.heading}</h2>
          <p className="max-w-prose">{m.formulas.intro}</p>
          <ul
            data-testid="formulas"
            className="flex max-w-3xl flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3 font-mono text-[0.9375rem] tabular-nums"
          >
            {m.formulas
              .lines(formatConstant(BTUH_PER_TON), formatConstant(W_PER_BTUH))
              .map((l) => (
                <li key={l} className="wrap-anywhere">
                  {l}
                </li>
              ))}
          </ul>
          <h3 className="pt-2">{m.formulas.unitsHeading}</h3>
          <p className="max-w-prose">{m.formulas.unitsIntro}</p>
          <Table
            caption={m.formulas.unitsHeading}
            columns={m.formulas.unitColumns}
            rows={unitRows}
          />
          <p className="max-w-prose">{m.formulas.kwNote}</p>
        </section>

        <ProseSection id="sources" heading={m.sources.heading}>
          <ul className="flex flex-col gap-2">
            {m.sources.items.map((s) => (
              <li key={s.href}>
                <a href={s.href} className={PROSE_LINK}>
                  {s.name}
                </a>
                . {s.use}
              </li>
            ))}
          </ul>
        </ProseSection>

        <ProseSection id="size-classes" heading={m.sizeClasses.heading}>
          <p>{m.sizeClasses.intro}</p>
          <ol className="flex list-decimal flex-col gap-1 pl-6">
            {m.sizeClasses
              .steps(formatRatioPercent(SIZE_CLASS_BAND))
              .map((s) => (
                <li key={s}>{s}</li>
              ))}
          </ol>
          <p>
            {m.sizeClasses.list(
              US_SIZE_CLASS_TONS.map(formatInputValue).join(", "),
            )}
          </p>
          <p>{m.sizeClasses.notAdvice}</p>
        </ProseSection>

        <ProseSection id="rounding" heading={m.rounding.heading}>
          <ul className="flex list-disc flex-col gap-1 pl-6">
            {m.rounding.items(formatInputValue(MAX_INPUT_VALUE)).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </ProseSection>

        <ProseSection id="version" heading={m.version.heading}>
          <p data-testid="engine-version">
            {m.version.engine(ENGINE_VERSION)}
            {site.releaseDate &&
              ` ${m.version.updated(formatDate(site.releaseDate))}`}
          </p>
        </ProseSection>
      </div>
    </ProsePage>
  );
}
