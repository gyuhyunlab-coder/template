import { describe, expect, it } from "vitest";

import { averageRadarStats, buildLevelRadar, computeRadarStats } from "@/lib/level-radar";

describe("computeRadarStats", () => {
  it("활동이 없으면 전부 0/null인 통계를 반환한다", () => {
    const stats = computeRadarStats([]);
    expect(stats).toEqual({
      avgDistanceKm: 0,
      avgPaceMinPerKm: 0,
      runsPerWeek: 0,
      avgCadenceSpm: null,
      avgHrBpm: null,
    });
  });

  it("거리·페이스 평균과 주당 러닝 횟수를 계산한다", () => {
    const stats = computeRadarStats([
      { date: "2026-01-01T00:00:00Z", distanceKm: 5, avgPaceMinPerKm: 6, avgCadenceSpm: 160, avgHrBpm: 140 },
      { date: "2026-01-08T00:00:00Z", distanceKm: 7, avgPaceMinPerKm: 5.5, avgCadenceSpm: 165, avgHrBpm: 145 },
      { date: "2026-01-15T00:00:00Z", distanceKm: 6, avgPaceMinPerKm: 5.8, avgCadenceSpm: null, avgHrBpm: null },
    ]);
    expect(stats.avgDistanceKm).toBeCloseTo(6, 5);
    expect(stats.avgPaceMinPerKm).toBeCloseTo((6 + 5.5 + 5.8) / 3, 5);
    expect(stats.runsPerWeek).toBeCloseTo(3 / 2, 5); // 2주 간격에 3회
    expect(stats.avgCadenceSpm).toBeCloseTo(162.5, 5); // null 제외 평균
    expect(stats.avgHrBpm).toBeCloseTo(142.5, 5);
  });
});

describe("averageRadarStats", () => {
  it("피어가 없으면 0/null 통계를 반환한다", () => {
    expect(averageRadarStats([])).toEqual({
      avgDistanceKm: 0,
      avgPaceMinPerKm: 0,
      runsPerWeek: 0,
      avgCadenceSpm: null,
      avgHrBpm: null,
    });
  });

  it("여러 피어의 통계를 항목별로 평균낸다", () => {
    const avg = averageRadarStats([
      { avgDistanceKm: 4, avgPaceMinPerKm: 6, runsPerWeek: 2, avgCadenceSpm: 160, avgHrBpm: 140 },
      { avgDistanceKm: 8, avgPaceMinPerKm: 5, runsPerWeek: 4, avgCadenceSpm: null, avgHrBpm: 150 },
    ]);
    expect(avg.avgDistanceKm).toBeCloseTo(6, 5);
    expect(avg.avgPaceMinPerKm).toBeCloseTo(5.5, 5);
    expect(avg.runsPerWeek).toBeCloseTo(3, 5);
    expect(avg.avgCadenceSpm).toBeCloseTo(160, 5); // null은 제외하고 평균
    expect(avg.avgHrBpm).toBeCloseTo(145, 5);
  });
});

describe("buildLevelRadar", () => {
  it("내가 모든 지표에서 앞서면 다섯 축 모두 내 점수가 100이다", () => {
    const mine = { avgDistanceKm: 10, avgPaceMinPerKm: 5, runsPerWeek: 4, avgCadenceSpm: 170, avgHrBpm: 130 };
    const peer = { avgDistanceKm: 5, avgPaceMinPerKm: 6, runsPerWeek: 2, avgCadenceSpm: 160, avgHrBpm: 145 };
    const axes = buildLevelRadar(mine, peer);
    for (const axis of axes) {
      expect(axis.mineScore).toBe(100);
      expect(axis.peerScore).toBeLessThan(100);
    }
  });

  it("페이스와 심박수는 낮을수록 더 높은 점수를 받는다(역수 스케일)", () => {
    const mine = { avgDistanceKm: 5, avgPaceMinPerKm: 5, runsPerWeek: 3, avgCadenceSpm: 160, avgHrBpm: 130 };
    const peer = { avgDistanceKm: 5, avgPaceMinPerKm: 7, runsPerWeek: 3, avgCadenceSpm: 160, avgHrBpm: 150 };
    const axes = buildLevelRadar(mine, peer);
    const speed = axes.find((a) => a.key === "speed")!;
    const recovery = axes.find((a) => a.key === "recovery")!;
    expect(speed.mineScore).toBeGreaterThan(speed.peerScore); // 페이스가 더 빠름(숫자가 작음)
    expect(recovery.mineScore).toBeGreaterThan(recovery.peerScore); // 심박수가 더 낮음
  });

  it("케이던스나 심박수 데이터가 한쪽에 없으면 그 축은 50대50 중립으로 처리한다", () => {
    const mine = { avgDistanceKm: 5, avgPaceMinPerKm: 6, runsPerWeek: 3, avgCadenceSpm: null, avgHrBpm: null };
    const peer = { avgDistanceKm: 5, avgPaceMinPerKm: 6, runsPerWeek: 3, avgCadenceSpm: 160, avgHrBpm: 140 };
    const axes = buildLevelRadar(mine, peer);
    expect(axes.find((a) => a.key === "efficiency")).toMatchObject({ mineScore: 50, peerScore: 50 });
    expect(axes.find((a) => a.key === "recovery")).toMatchObject({ mineScore: 50, peerScore: 50 });
  });

  it("양쪽 값이 완전히 같으면 그 축은 100대100이다", () => {
    const same = { avgDistanceKm: 5, avgPaceMinPerKm: 6, runsPerWeek: 3, avgCadenceSpm: 160, avgHrBpm: 140 };
    const axes = buildLevelRadar(same, same);
    for (const axis of axes) {
      expect(axis.mineScore).toBe(100);
      expect(axis.peerScore).toBe(100);
    }
  });
});
