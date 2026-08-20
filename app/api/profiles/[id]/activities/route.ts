import { getDemoProfile, listSeedActivities } from "@/lib/seed-profiles";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/profiles/[id]/activities">
) {
  const { id } = await ctx.params;
  if (!getDemoProfile(id)) {
    return Response.json({ error: "존재하지 않는 프로필입니다." }, { status: 404 });
  }
  return Response.json(listSeedActivities(id));
}
