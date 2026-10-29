/**
 * Flat picture of the wall unit with its display as real text. First paint,
 * the 3D loading state and the no-WebGL fallback all use it.
 */
export function AcPoster({
  temperature,
  tons,
  btuh,
}: {
  temperature: string;
  tons: string;
  btuh: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-start justify-center pt-[8%]"
    >
      <div className="relative w-[78%]">
        <svg viewBox="0 0 320 100" className="h-auto w-full">
          <rect
            x="2"
            y="2"
            width="316"
            height="88"
            rx="18"
            style={{
              fill: "var(--appliance)",
              stroke: "var(--appliance-shade)",
            }}
            strokeWidth="2"
          />
          <path
            d="M14 30H306"
            style={{ stroke: "var(--appliance-shade)" }}
            strokeWidth="1.5"
          />
          <rect
            x="26"
            y="78"
            width="268"
            height="10"
            rx="5"
            style={{ fill: "var(--lcd)" }}
          />
        </svg>
        <div
          className="absolute top-[38%] right-[5%] flex w-[24%] flex-col items-center rounded-md px-1 py-0.5 font-mono leading-tight tabular-nums"
          style={{ background: "var(--lcd)", color: "var(--lcd-ink)" }}
        >
          <span className="text-sm font-medium sm:text-base">
            {temperature}
          </span>
          <span className="text-[0.5rem] sm:text-[0.6rem]">
            {tons} · {btuh}
          </span>
        </div>
      </div>
    </div>
  );
}
