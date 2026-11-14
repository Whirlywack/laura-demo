import { redirect } from "next/navigation";

// ponytail: the dashboard lives at /demo; the home page replaces this forward when it is built.
export default function Home() {
  redirect("/demo");
}
