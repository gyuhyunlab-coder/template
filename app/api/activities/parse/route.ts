import { parseGpx } from "@/lib/gpx";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const gpxText = typeof body?.gpxText === "string" ? body.gpxText : "";

  const result = parseGpx(gpxText);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true, activity: result.activity });
}
