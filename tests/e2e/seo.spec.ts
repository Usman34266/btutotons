import { expect, test } from "@playwright/test";

const PATHS = [
  "/",
  "/tons-to-btu/",
  "/batch-btu-to-tons/",
  "/ac-tonnage-by-model-number/",
  "/methodology/",
  "/about/",
  "/privacy/",
  "/terms/",
  "/24000-btu-to-tons/",
  "/1-5-ton-to-btu/",
];

test.describe("SEO files", () => {
  test("sitemap lists 43 live pages that all return 200", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");
    const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]!).pathname,
    );
    expect(locs).toHaveLength(43);
    for (const path of locs) {
      const page = await request.get(path, { maxRedirects: 0 });
      expect(page.status(), path).toBe(200);
    }
  });

  test("brand icons and the Organization logo are linked and served (D109)", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain(
      '<link rel="icon" href="/icon.svg" type="image/svg+xml"/>',
    );
    expect(html).toContain(
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>',
    );
    const files = {
      "/icon.svg": "image/svg+xml",
      "/favicon.ico": "image/",
      "/apple-touch-icon.png": "image/png",
      "/logo.png": "image/png",
    };
    for (const [path, type] of Object.entries(files)) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()["content-type"], path).toContain(type);
    }
  });

  test("robots.txt allows all and names the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("Allow: /");
    expect(text).toContain("Sitemap: https://btutotons.com/sitemap.xml");
  });
});

test.describe("share cards and structured data", () => {
  test("every page has its own PNG card, Twitter tags and valid JSON-LD", async ({
    request,
  }) => {
    const images = new Set<string>();
    for (const path of PATHS) {
      const html = await (await request.get(path)).text();
      const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      expect(og, path).toBeDefined();
      const imagePath = new URL(og!).pathname;
      expect(imagePath, path).toBe(`${path}opengraph-image`);
      images.add(imagePath);
      expect(html, path).toContain(
        '<meta name="twitter:card" content="summary_large_image"/>',
      );
      expect(html, path).toContain('<meta property="og:image:alt"');

      const img = await request.get(imagePath);
      expect(img.status(), imagePath).toBe(200);
      expect(img.headers()["content-type"], imagePath).toBe("image/png");

      const ld = html.match(
        /<script type="application\/ld\+json">([^<]+)<\/script>/,
      )?.[1];
      const data = JSON.parse(ld!) as { "@graph": { "@type": string }[] };
      expect(
        data["@graph"].map((n) => n["@type"]),
        path,
      ).toEqual(
        path === "/"
          ? ["Organization", "WebSite", "WebPage"]
          : ["Organization", "WebSite", "WebPage", "BreadcrumbList"],
      );
    }
    expect(images.size).toBe(PATHS.length);
  });
});
