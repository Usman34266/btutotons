import { site } from "@/config/site";
import { BrandMark } from "@/lib/brand-mark";

/**
 * Mark + wordmark (D109). The joining "to" is set lighter so the two units
 * carry the name; the accessible name stays the plain site name.
 */
export function Logo() {
  const [from, joiner, to] = site.name.split(/ (to) /);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <BrandMark className="size-6.5 shrink-0 text-accent" />
      {joiner ? (
        <span>
          {from}{" "}
          <span className="font-normal text-muted-foreground">{joiner}</span>{" "}
          {to}
        </span>
      ) : (
        site.name
      )}
    </span>
  );
}
