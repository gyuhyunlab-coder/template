import { listDemoProfiles, listSeedActivities } from "@/lib/seed-profiles";
import { averageRadarStats, computeRadarStats } from "@/lib/level-radar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    if (!profileId) {
      return Response.json({ error: "profileId가 필요합니다." }, { status: 400 });
    }

    const profiles = listDemoProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (!target) {
      return Response.json({ error: "존재하지 않는 프로필입니다." }, { status: 404 });
    }

    const peers = profiles.filter(
      (p) => p.id !== profileId && p.ageBand === target.ageBand && p.gender === target.gender
    );
    const peerStats = peers.map((p) => computeRadarStats(listSeedActivities(p.id)));

    return Response.json(
      {
        peerCount: peers.length,
        peerAverage: averageRadarStats(peerStats),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/level-radar error:", err);
    return Response.json(
      {
        peerCount: 0,
        peerAverage: { avgDistanceKm: 0, avgPaceMinPerKm: 0, runsPerWeek: 0, avgCadenceSpm: null, avgHrBpm: null },
      },
      { status: 200 }
    );
  }
}
