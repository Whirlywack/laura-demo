import { redirect } from "next/navigation";

// Rendered on each request, so / answers with a real 307 rather than a pre-built page that redirects in the browser.
export const dynamic = "force-dynamic";

// ponytail: the dashboard lives at /demo; the home page replaces this forward when it is built.
export default function Home() {
  redirect("/demo");
}
