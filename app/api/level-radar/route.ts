import { listDemoProfiles, listSeedActivities } from "@/lib/seed-profiles";
import { averageRadarStats, computeRadarStats } from "@/lib/level-radar";

// 이름 있는 개인이 아니라 "비슷한 러너 평균"만 반환한다 — 이 화면은 개인 앱에서
// 다른 사람의 신원을 드러내지 않고 내 수준만 가늠하는 용도다.
export async function GET(request: Request) {
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

  return Response.json({
    peerCount: peers.length,
    peerAverage: averageRadarStats(peerStats),
  });
}
