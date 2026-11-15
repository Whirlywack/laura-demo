import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// The one header on every page: the "laura" wordmark (the home page), the same five links everywhere, with the page
// you are on underlined, and on the right whatever that page needs (the home page's "See the demo", Today's Call
// status and call button). A visitor on the home page can go straight to History or the Care plan, and from the demo
// there is a plain way back to Home.
type Page = "home" | "about" | "today" | "history";

const menuItem = (active: boolean): CSSProperties => ({
  display: "inline-flex", alignItems: "center", boxSizing: "border-box", minHeight: "var(--hit-min)", padding: "8px 0", border: 0,
  borderBottom: `3px solid ${active ? "var(--ink)" : "transparent"}`, background: "none", font: "inherit", fontWeight: active ? 700 : 400,
  color: "inherit", textDecoration: "none", cursor: "pointer",
});

// `onCarePlan`: on Today the Care plan is a row further down the same page, so its menu item opens it there.
// Everywhere else it is a link to Today with the row open (/demo?plan=1).
export function SiteHeader({ current, onCarePlan, children }: { current: Page; onCarePlan?: () => void; children?: ReactNode }) {
  const item = (page: Page | null, href: string, text: string) => (
    <Link href={href} aria-current={page === current ? "page" : undefined} className="laura-button" style={menuItem(page === current)}>
      {text}
    </Link>
  );
  return (
    <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 40px", padding: "26px 20px 22px" }}>
      <Link className="laura-button" href="/" aria-label="Laura, home page" style={{ color: "inherit", textDecoration: "none", font: "700 var(--size-wordmark-large)/1 var(--font-sans)", letterSpacing: "-.06em" }}>
        laura
      </Link>
      <div style={{ flex: 1 }} />
      <nav style={{ display: "flex", flexWrap: "wrap", gap: "0 36px", whiteSpace: "nowrap" }}>
        {item("home", "/", "Home")}
        {item("about", "/about", "Why Laura")}
        {item("today", "/demo", "Today")}
        {onCarePlan ? (
          <button type="button" className="laura-button" onClick={onCarePlan} style={menuItem(false)}>Care plan</button>
        ) : (
          item(null, "/demo?plan=1", "Care plan")
        )}
        {item("history", "/demo/history", "History")}
      </nav>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 32px" }}>{children}</div>
    </header>
  );
}
