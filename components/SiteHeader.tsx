import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// The header the home page and the dashboard share, from the design system's home page: the "laura" wordmark
// (back to the home page), a menu (the home page's sections unless the page passes its own, as the dashboard and
// the History pages do), and whatever the page puts on the right (children).
const link: CSSProperties = { color: "inherit", textDecoration: "none", padding: "10px 0" };

/** A menu item on the dashboard and History pages, underlined when it is the page you are on. */
export const menuItem = (active: boolean): CSSProperties => ({
  display: "inline-flex", alignItems: "center", boxSizing: "border-box", minHeight: "var(--hit-min)", padding: "8px 0", border: 0,
  borderBottom: `3px solid ${active ? "var(--ink)" : "transparent"}`, background: "none", font: "inherit", fontWeight: active ? 700 : 400,
  color: "inherit", textDecoration: "none", cursor: "pointer",
});

export function SiteHeader({ menu, children }: { menu?: ReactNode; children: ReactNode }) {
  return (
    <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 40px", padding: "26px 20px 22px" }}>
      <Link className="laura-button" href="/" aria-label="Laura, home page" style={{ ...link, padding: 0, font: "700 var(--size-wordmark-large)/1 var(--font-sans)", letterSpacing: "-.06em" }}>
        laura
      </Link>
      <div style={{ flex: 1 }} />
      <nav style={{ display: "flex", flexWrap: "wrap", gap: "0 36px", whiteSpace: "nowrap" }}>
        {menu ?? (
          <>
            <Link className="laura-button" href="/#one-morning" style={link}>Listen to a call</Link>
            <Link className="laura-button" href="/#what-laura-does" style={link}>What Laura does</Link>
            <Link className="laura-button" href="/#about" style={link}>About</Link>
          </>
        )}
      </nav>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 32px" }}>{children}</div>
    </header>
  );
}
