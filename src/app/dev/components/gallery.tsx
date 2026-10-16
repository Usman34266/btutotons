"use client";

import { ChevronDown, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DigitMorph } from "@/components/converter/digit-morph";
import { QuantityChip } from "@/components/converter/quantity-chip";
import { UnitTooltip } from "@/components/converter/unit-tooltip";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { IceBlocks } from "@/components/visuals/ice-blocks";
import {
  CAPACITY_UNIT_IDS,
  UNITS,
  capacity,
  convertCapacity,
  formatAmount,
  formatNumber,
  isPrecision,
  type Precision,
} from "@/engine";

const TOKENS = [
  "bg",
  "surface",
  "ink",
  "muted",
  "border",
  "accent",
  "accent-soft",
  "electric",
  "energy",
  "danger",
  "success",
];
const MORPH_VALUES = [19_000, 19_500, 24_000, 0.5, 1_000_000];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <span className="w-40 shrink-0 text-label text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function Gallery() {
  const [precision, setPrecision] = useState<Precision>(4);
  const [morphIndex, setMorphIndex] = useState(0);
  const morphTons = convertCapacity(
    capacity(MORPH_VALUES[morphIndex] ?? 0, "btuh"),
  ).tons;
  const sample = convertCapacity(capacity(19_000, "btuh"), { precision });

  return (
    <main
      id="main"
      className="mx-auto flex max-w-[1120px] flex-col gap-8 px-4 py-8"
    >
      <Toaster />
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1>Coolant components</h1>
          <p className="text-muted-foreground">
            Every component and state. Dev only, not exported.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Color tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {TOKENS.map((t) => (
            <div key={t} className="flex flex-col gap-1">
              <span
                className="h-12 rounded-lg border border-border"
                style={{ background: `var(--${t})` }}
              />
              <code className="text-label">--{t}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <p className="text-result">1.5833</p>
        <h1>H1 · BTU to Tons Calculator</h1>
        <h2>H2 · What do BTU/hr and tons mean?</h2>
        <p>
          Body · Enter your AC&apos;s BTU rating to see its size in tons. 12,000
          BTU/hr = 1 ton.
        </p>
        <p className="text-label">Label · Cooling capacity</p>
        <code className="font-mono">19,000 ÷ 12,000 = 1.5833</code>
      </Section>

      <Section title="Button">
        {(["default", "outline", "secondary", "ghost", "link"] as const).map(
          (variant) => (
            <Row key={variant} label={variant}>
              <Button variant={variant}>Convert</Button>
              <Button variant={variant}>
                <Copy aria-hidden="true" /> Copy result
              </Button>
              <Button variant={variant} disabled>
                Disabled
              </Button>
            </Row>
          ),
        )}
        <Row label="loading">
          <Button aria-busy="true" disabled>
            <Loader2 aria-hidden="true" className="animate-spin" /> Preparing
            CSV
          </Button>
        </Row>
        <Row label="icon">
          <Button variant="outline" size="icon" aria-label="Copy result">
            <Copy aria-hidden="true" />
          </Button>
        </Row>
        <p className="text-label text-muted-foreground">
          Hover, active and focus-visible are live: use the mouse and Tab.
        </p>
      </Section>

      <Section title="Input (GOV.UK pattern)">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="g-empty">Cooling capacity (empty)</Label>
            <p id="g-empty-hint" className="text-muted-foreground">
              Find it on the label or spec sheet.
            </p>
            <Input
              id="g-empty"
              inputMode="decimal"
              placeholder="e.g. 18000"
              aria-describedby="g-empty-hint"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="g-filled">Cooling capacity (filled)</Label>
            <Input id="g-filled" inputMode="decimal" defaultValue="19,000" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="g-error">Cooling capacity (error)</Label>
            <Input
              id="g-error"
              inputMode="decimal"
              defaultValue="12abc"
              aria-invalid="true"
              aria-describedby="g-error-msg"
            />
            <p id="g-error-msg" className="font-medium text-danger">
              Use numbers only, like 24000 or 24,000.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="g-disabled">Cooling capacity (disabled)</Label>
            <Input id="g-disabled" defaultValue="18000" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="g-unit">Unit (native select)</Label>
            <NativeSelect id="g-unit" defaultValue="btuh">
              {CAPACITY_UNIT_IDS.map((id) => (
                <option key={id} value={id}>
                  {UNITS[id].label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="g-unit-disabled">Unit (disabled)</Label>
            <NativeSelect id="g-unit-disabled" disabled defaultValue="tr">
              <option value="tr">{UNITS.tr.label}</option>
            </NativeSelect>
          </div>
        </div>
      </Section>

      <Section title="Tabs (direction)">
        <Tabs defaultValue="btu-to-tons">
          <TabsList aria-label="Conversion direction">
            <TabsTrigger value="btu-to-tons">BTU/hr → tons</TabsTrigger>
            <TabsTrigger value="tons-to-btu">Tons → BTU/hr</TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
          <TabsContent value="btu-to-tons">BTU/hr → tons panel</TabsContent>
          <TabsContent value="tons-to-btu">Tons → BTU/hr panel</TabsContent>
        </Tabs>
      </Section>

      <Section title="Toggle group (precision)">
        <Row label={`decimals: ${precision}`}>
          <ToggleGroup
            type="single"
            value={String(precision)}
            onValueChange={(v) => {
              const n = Number(v);
              if (isPrecision(n)) setPrecision(n);
            }}
            aria-label="Decimal places"
          >
            {[2, 4, 6].map((p) => (
              <ToggleGroupItem key={p} value={String(p)}>
                {p}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup type="single" disabled aria-label="Disabled group">
            <ToggleGroupItem value="2">2</ToggleGroupItem>
          </ToggleGroup>
        </Row>
      </Section>

      <Section title="Collapsible (show the math)">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="group -ml-4">
              Show the math
              <ChevronDown
                aria-hidden="true"
                className="transition-transform duration-150 group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <code className="mt-2 block rounded-lg border border-border bg-surface p-4 font-mono">
              {sample.equation}
            </code>
          </CollapsibleContent>
        </Collapsible>
      </Section>

      <Section title="Unit tooltips">
        <Row label="popover triggers">
          <span className="inline-flex items-center gap-1">
            BTU/hr <UnitTooltip term="btuh" />
          </span>
          <span className="inline-flex items-center gap-1">
            Ton <UnitTooltip term="ton" />
          </span>
          <span className="inline-flex items-center gap-1">
            Cooling kW <UnitTooltip term="coolingKw" />
          </span>
          <span className="inline-flex items-center gap-1">
            EER (P1) <UnitTooltip term="eer" />
          </span>
        </Row>
      </Section>

      <Section title="Quantity chips">
        <Row label="on page">
          <QuantityChip kind="capacity" />
          <QuantityChip kind="electrical" />
          <QuantityChip kind="energy" />
        </Row>
        <div className="rounded-xl bg-accent-soft p-4 [&_.text-muted-foreground]:text-ink">
          <Row label="on result panel">
            <QuantityChip kind="capacity" />
            <QuantityChip kind="electrical" />
            <QuantityChip kind="energy" />
          </Row>
        </div>
      </Section>

      <Section title="Ice blocks">
        {[0, 0.5, 1.5833, 2, 6, 7.5, 1e6].map((tons) => (
          <Row key={tons} label={formatAmount(tons, "tr", { precision: 2 })}>
            <IceBlocks tons={tons} />
          </Row>
        ))}
      </Section>

      <Section title="Digit morph">
        <div className="flex flex-col gap-4 rounded-xl bg-accent-soft p-6 shadow-card">
          <QuantityChip kind="capacity" className="self-start" />
          <output className="text-result">
            <DigitMorph text={formatNumber(morphTons, { precision })} />{" "}
            <span className="text-2xl font-medium">TR</span>
          </output>
          <IceBlocks tons={morphTons} captionClassName="text-ink" />
        </div>
        <Row label="change value">
          <Button
            variant="outline"
            onClick={() => setMorphIndex((i) => (i + 1) % MORPH_VALUES.length)}
          >
            Next value
          </Button>
        </Row>
      </Section>

      <Section title="Toast (copied state)">
        <Row label="success">
          <Button variant="outline" onClick={() => toast.success("Copied")}>
            <Copy aria-hidden="true" /> Copy result
          </Button>
        </Row>
      </Section>
    </main>
  );
}
