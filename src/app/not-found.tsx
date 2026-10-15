import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | BTU to Tons",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1120px] px-4 py-8">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-2">
        This page doesn&apos;t exist. Try the converter instead.
      </p>
      <p className="mt-4">
        <Link href="/" className="underline">
          Go to the BTU to Tons Calculator
        </Link>
      </p>
    </main>
  );
}
