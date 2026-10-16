"use client";

import { useEffect, useState } from "react";

/**
 * Polite screen-reader announcement. Results are announced once the value
 * settles (debounced); focus never moves.
 */
export function LiveStatus({
  message,
  delay = 900,
}: {
  message: string | null;
  delay?: number;
}) {
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const timer = setTimeout(
      () => setAnnounced(message ?? ""),
      message ? delay : 0,
    );
    return () => clearTimeout(timer);
  }, [message, delay]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announced}
    </div>
  );
}
