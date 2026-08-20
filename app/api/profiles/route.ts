import { listDemoProfiles } from "@/lib/seed-profiles";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = listDemoProfiles();
    return Response.json(profiles, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("GET /api/profiles error:", err);
    return Response.json([], { status: 200 });
  }
}
