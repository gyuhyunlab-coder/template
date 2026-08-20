import { formatPace } from "@/lib/format";
import type { ActivityEntry } from "@/lib/activity-types";

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-border bg-card px-4 py-3 min-w-[7.5rem]">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xl font-semibold tabular-nums ${accent ? "text-accent-run" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function StatStrip({ activities }: { activities: ActivityEntry[] }) {
  const totalRuns = activities.length;
  const totalDistanceKm = activities.reduce((sum, a) => sum + a.distanceKm, 0);
  const recentFive = activities.slice(0, 5);
  const recentAvgPace =
    recentFive.length > 0
      ? recentFive.reduce((sum, a) => sum + a.avgPaceMinPerKm, 0) / recentFive.length
      : 0;
  const prCount = activities.filter((a) => a.isLongestDistancePr || a.isBestPacePr).length;

  return (
    <div className="flex flex-wrap gap-2.5" aria-label="요약 통계">
      <StatTile label="총 러닝" value={`${totalRuns}회`} />
      <StatTile label="누적 거리" value={`${totalDistanceKm.toFixed(1)}km`} />
      <StatTile label="최근 평균 페이스" value={formatPace(recentAvgPace)} />
      <StatTile label="신기록" value={`${prCount}회`} accent />
    </div>
  );
}
