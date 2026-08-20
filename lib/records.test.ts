import { describe, expect, it } from "vitest";

import { withPersonalRecords, type ActivityRecord } from "@/lib/records";

function activity(overrides: Partial<ActivityRecord> & { id: string }): ActivityRecord {
  return {
    date: "2026-01-01T00:00:00Z",
    distanceKm: 5,
    durationSec: 1800,
    avgPaceMinPerKm: 6,
    avgCadenceSpm: null,
    avgHrBpm: null,
    ...overrides,
  };
}

describe("withPersonalRecords", () => {
  it("첫 활동은 최장 거리와 최고 페이스 기록을 모두 세운다", () => {
    const [flagged] = withPersonalRecords([
      activity({ id: "a", date: "2026-01-01T00:00:00Z", distanceKm: 5, avgPaceMinPerKm: 6 }),
    ]);
    expect(flagged.isLongestDistancePr).toBe(true);
    expect(flagged.isBestPacePr).toBe(true);
  });

  it("더 길게 뛴 활동만 최장 거리 기록을 갱신하고, 페이스가 느리면 페이스 기록은 갱신하지 않는다", () => {
    const activities = [
      activity({ id: "a", date: "2026-01-01T00:00:00Z", distanceKm: 5, avgPaceMinPerKm: 6 }),
      activity({ id: "b", date: "2026-01-02T00:00:00Z", distanceKm: 8, avgPaceMinPerKm: 6.5 }),
    ];
    const flagged = withPersonalRecords(activities);
    const b = flagged.find((a) => a.id === "b")!;
    expect(b.isLongestDistancePr).toBe(true);
    expect(b.isBestPacePr).toBe(false);
  });

  it("날짜 순서가 뒤섞여 입력되어도 시간순으로 기록을 판정한다", () => {
    const activities = [
      activity({ id: "later", date: "2026-01-03T00:00:00Z", distanceKm: 10, avgPaceMinPerKm: 5 }),
      activity({ id: "earlier", date: "2026-01-01T00:00:00Z", distanceKm: 5, avgPaceMinPerKm: 6 }),
    ];
    const flagged = withPersonalRecords(activities);
    // 입력 순서를 그대로 보존한다: [later, earlier]
    expect(flagged.map((a) => a.id)).toEqual(["later", "earlier"]);
    expect(flagged.find((a) => a.id === "earlier")!.isLongestDistancePr).toBe(true);
    expect(flagged.find((a) => a.id === "later")!.isLongestDistancePr).toBe(true);
  });

  it("이전 기록보다 짧고 느린 활동은 어떤 신기록도 세우지 않는다", () => {
    const activities = [
      activity({ id: "a", date: "2026-01-01T00:00:00Z", distanceKm: 10, avgPaceMinPerKm: 5 }),
      activity({ id: "b", date: "2026-01-02T00:00:00Z", distanceKm: 4, avgPaceMinPerKm: 7 }),
    ];
    const flagged = withPersonalRecords(activities);
    const b = flagged.find((a) => a.id === "b")!;
    expect(b.isLongestDistancePr).toBe(false);
    expect(b.isBestPacePr).toBe(false);
  });
});
