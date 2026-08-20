"use client";

import { useMemo, useState } from "react";
import { Route } from "lucide-react";
import { projectPaths } from "@/lib/heatmap-projection";
import type { ActivityEntry, DemoProfile } from "@/lib/activity-types";

// 캔버스는 이 viewBox 기준 비율로 그려지고, SVG의 width="100%" 덕분에 실제 렌더 크기에
// 맞춰 반응형으로 늘어난다(가로 스크롤 없음).
const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 420;
const PADDING = 24;

// Strava 히트맵의 "기간 선택" 개념을 빌렸다 — 전체 누적 대신 최근 며칠간의
// 경로만 걸러 보면서 활동 밀도 변화를 확인할 수 있다.
const RANGE_OPTIONS = [
  { label: "전체", days: null },
  { label: "최근 90일", days: 90 },
  { label: "최근 30일", days: 30 },
  { label: "최근 7일", days: 7 },
] as const;

export function HeatmapView({
  profile,
  activities,
}: {
  profile: DemoProfile;
  activities: ActivityEntry[];
}) {
  const [rangeDays, setRangeDays] = useState<number | null>(null);

  // 포인트가 2개 미만인 경로는 선으로 그릴 수 없으니 제외한다.
  const allTracks = useMemo(
    () => activities.filter((a) => a.path.length >= 2),
    [activities],
  );

  const tracks = useMemo(() => {
    if (rangeDays == null || allTracks.length === 0) return allTracks;
    // 기준점은 시스템 시계(Date.now())가 아니라 이 프로필의 가장 최근 활동
    // 날짜로 잡는다 — 렌더 중에 impure한 Date.now()를 부르지 않아도 되고,
    // 시드 데이터를 오래 전에 생성해 둔 경우에도 "최근"이 데이터 기준으로
    // 일관되게 맞는다.
    const latestMs = Math.max(...allTracks.map((a) => new Date(a.date).getTime()));
    const cutoff = latestMs - rangeDays * 24 * 60 * 60 * 1000;
    return allTracks.filter((a) => new Date(a.date).getTime() >= cutoff);
  }, [allTracks, rangeDays]);

  const totalDistanceKm = useMemo(
    () => tracks.reduce((sum, a) => sum + a.distanceKm, 0),
    [tracks],
  );

  const projectedPaths = useMemo(
    () =>
      projectPaths(
        tracks.map((a) => a.path),
        { width: VIEW_WIDTH, height: VIEW_HEIGHT, padding: PADDING },
      ),
    [tracks],
  );

  if (allTracks.length === 0) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Route className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {profile.name}의 활동 경로가 아직 없습니다. GPX를 업로드하면 여기에 경로가 쌓입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">
          {profile.name}의 누적 경로 아트
        </h2>
        <p className="text-xs text-muted-foreground">
          활동 {tracks.length}건 · 누적 {totalDistanceKm.toFixed(1)}km
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="기간 선택">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setRangeDays(option.days)}
            aria-pressed={rangeDays === option.days}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              rangeDays === option.days
                ? "bg-accent-run text-accent-run-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tracks.length === 0 ? (
        <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            선택한 기간에는 활동이 없습니다. 다른 기간을 선택해 보세요.
          </p>
        </div>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-2">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${profile.name}의 누적 경로 히트맵`}
          className="block w-full aspect-[640/420]"
        >
          <defs>
            {/* 경로가 몰린 중심부를 은은하게 밝혀 겹침이 눈에 더 잘 띄게 하는 배경 후광. */}
            <radialGradient id="heatmap-glow" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--color-accent-run)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-accent-run)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#heatmap-glow)" />

          {/* 굵고 옅은 레이어: 경로가 겹칠수록 뿌옇게 번지는 광원 효과. */}
          <g fill="none" stroke="var(--color-accent-run)" strokeLinecap="round" strokeLinejoin="round">
            {projectedPaths.map((points, i) => (
              <polyline
                key={`glow-${tracks[i].id}`}
                points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                strokeWidth={4.5}
                strokeOpacity={0.08}
              />
            ))}
          </g>

          {/* 가늘고 또렷한 레이어: 실제 궤적 선, 겹칠수록 진해져 누적된 느낌을 준다. */}
          <g fill="none" stroke="var(--color-accent-run)" strokeLinecap="round" strokeLinejoin="round">
            {projectedPaths.map((points, i) => (
              <polyline
                key={`line-${tracks[i].id}`}
                points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                strokeWidth={1.4}
                strokeOpacity={0.4}
              />
            ))}
          </g>
        </svg>
      </div>
      )}

      <p className="text-xs text-muted-foreground">
        경로가 자주 겹치는 구간일수록 선이 더 진하게 보입니다.
      </p>
    </div>
  );
}
