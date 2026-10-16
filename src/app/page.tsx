import type { Metadata } from "next";

// M0 placeholder. The converter, chart and content arrive in M3–M5.
export const metadata: Metadata = {
  title: "BTU to Tons Calculator [12,000 BTU/hr = 1 Ton]",
  description:
    "Convert BTU/hr to tons instantly and see what size AC it is. Compare AC capacities, use common shortcuts and see cooling kW with clear formulas.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main id="main" className="mx-auto max-w-[1120px] px-4 py-8">
      <h1 className="text-4xl font-semibold">BTU to Tons Calculator</h1>
      <p className="mt-2">
        Enter your AC&apos;s BTU rating to see its size in tons. 12,000 BTU/hr =
        1 ton.
      </p>
    </main>
  );
}
