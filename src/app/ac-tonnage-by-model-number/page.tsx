import { ProsePage, ProseSection } from "@/components/layout/prose-page";
import { NameplateCapacityForm } from "@/components/tools/nameplate-capacity-form";
import { InteractiveNameplate } from "@/components/visuals/interactive-nameplate";
import { getContent } from "@/content";
import { formatInputValue } from "@/engine";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("nameplate");

/** The example rating on the illustration and in the form (spec p. 12). */
const EXAMPLE_BTUH = 35_000;

/** Reading guide only: no model lookup until a reviewed family dataset exists (spec p. 12). */
export default function NameplateGuidePage() {
  const { nameplate } = getContent();
  const example = formatInputValue(EXAMPLE_BTUH);
  return (
    <ProsePage route="nameplate" h1={nameplate.h1} lead={nameplate.opening}>
      <section aria-labelledby="read" className="flex flex-col gap-4 pt-4">
        <div className="flex max-w-prose flex-col gap-2">
          <h2 id="read">{nameplate.read.heading}</h2>
          <p>{nameplate.read.intro}</p>
        </div>
        <InteractiveNameplate capacityText={example} />
      </section>

      <section aria-labelledby="convert" className="flex flex-col gap-4 pt-4">
        <h2 id="convert">{nameplate.form.heading}</h2>
        <NameplateCapacityForm initialRaw={example} />
      </section>

      <div className="flex flex-col gap-10 pt-4">
        <ProseSection
          id="families"
          heading={nameplate.families.heading}
          body={nameplate.families.body}
        />
        <ProseSection
          id="unknown"
          heading={nameplate.unknown.heading}
          body={nameplate.unknown.body}
        />
      </div>
    </ProsePage>
  );
}
