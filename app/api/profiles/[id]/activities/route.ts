import { getDemoProfile, listSeedActivities } from "@/lib/seed-profiles";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/profiles/[id]/activities">
) {
  try {
    const { id } = await ctx.params;
    if (!getDemoProfile(id)) {
      return Response.json({ error: "존재하지 않는 프로필입니다." }, { status: 404 });
    }
    const activities = listSeedActivities(id);
    return Response.json(activities, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("GET /api/profiles/[id]/activities error:", err);
    return Response.json([], { status: 200 });
  }
}
