import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// The header the home page and the dashboard share, from the design system's home page: the "laura" wordmark
// (back to the home page), the menu, and whatever the page puts on the right (children).
const link: CSSProperties = { color: "inherit", textDecoration: "none", padding: "10px 0" };

export function SiteHeader({ children }: { children: ReactNode }) {
  return (
    <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 40px", padding: "26px 20px 22px" }}>
      <Link href="/" aria-label="Laura, home page" style={{ ...link, padding: 0, font: "700 var(--size-wordmark-large)/1 var(--font-sans)", letterSpacing: "-.06em" }}>
        laura
      </Link>
      <div style={{ flex: 1 }} />
      <nav style={{ display: "flex", flexWrap: "wrap", gap: "0 36px", whiteSpace: "nowrap" }}>
        <Link href="/#one-morning" style={link}>One morning</Link>
        <Link href="/#what-laura-does" style={link}>What Laura does</Link>
        <Link href="/#about" style={link}>About</Link>
      </nav>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 32px" }}>{children}</div>
    </header>
  );
}
