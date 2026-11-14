import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

// Checks over the repo's own files: no database, no network.
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const filesIn = (dir: string, ext: RegExp) =>
  (readdirSync(new URL(`../${dir}`, import.meta.url), { recursive: true }) as string[])
    .filter((f) => ext.test(f))
    .map((f) => read(`${dir}/${f}`));
const matches = (texts: string[], pattern: RegExp) => new Set(texts.flatMap((t) => [...t.matchAll(pattern)].map((m) => m[1])));
const sorted = (names: Iterable<string>) => [...names].sort();

test("every environment variable the code reads is listed in .env.example", () => {
  const code = ["app", "lib", "scripts"].flatMap((dir) => filesIn(dir, /\.tsx?$/));
  const used = matches(code, /(?:env\("|process\.env\.)([A-Z0-9_]*[A-Z0-9])\b/g);
  // A commented-out line counts: optional variables are listed that way.
  const listed = matches([read(".env.example")], /^#?\s*([A-Z0-9_]+)=/gm);

  expect(sorted([...used].filter((name) => !listed.has(name)))).toEqual([]);
});

test("every colour, size and spacing token the pages use is defined in app/globals.css", () => {
  const used = matches([...filesIn("app", /\.(tsx?|css)$/), ...filesIn("components", /\.tsx?$/)], /var\(--([a-z0-9-]+)/g);
  const defined = matches([read("app/globals.css")], /--([a-z0-9-]+)\s*:/g);

  expect(sorted([...used].filter((name) => !defined.has(name)))).toEqual([]);
});

test("every link inside the site goes to a page that exists, and every #section to an id on that page", () => {
  // app/page.tsx is "/", app/demo/page.tsx is "/demo".
  const pages = new Map(
    (readdirSync(new URL("../app", import.meta.url), { recursive: true }) as string[])
      .filter((f) => /(^|\/)page\.tsx$/.test(f))
      .map((f) => ["/" + f.replace(/\/?page\.tsx$/, ""), read(`app/${f}`)]),
  );
  const links = matches([...filesIn("app", /\.tsx$/), ...filesIn("components", /\.tsx$/)], /href=\{?"(\/[^"]*)"/g);
  const broken = [...links].filter((link) => {
    const [address, id] = link.split("#");
    const path = address.split("?")[0];
    const page = pages.get(path || "/");
    return !page || (id !== undefined && !page.includes(`id="${id}"`));
  });

  expect(links.size).toBeGreaterThan(0);
  expect(sorted(broken)).toEqual([]);
});
