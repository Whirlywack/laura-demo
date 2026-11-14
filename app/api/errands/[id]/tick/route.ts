import { writeClient } from "../../../../../lib/supabase";

// The Family carer ticks an Errand off on the page. The page can only read, so the done time is set here.
// There is no sign-in, so anyone with the page can tick; nothing else can be changed through this route.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await writeClient()
    .from("entries")
    .update({ done_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", "errand")
    .select("id");
  // 22P02: not an Entry id at all.
  if (error?.code === "22P02" || data?.length === 0) return Response.json({ ok: false, message: "There is no such errand" }, { status: 404 });
  if (error) throw new Error(`Could not tick the errand: ${error.message}`);
  return Response.json({ ok: true });
}
