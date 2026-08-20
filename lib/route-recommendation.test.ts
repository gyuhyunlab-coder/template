import { describe, expect, it } from "vitest";

import {
  computeExpectedDurationSec,
  computeTargetDistanceKm,
  decideRouteShape,
  resolveStartLocation,
  type GeolocationOutcome,
} from "@/lib/route-recommendation";

function activity(distanceKm: number, avgPaceMinPerKm = 6) {
  return { distanceKm, avgPaceMinPerKm };
}

describe("computeTargetDistanceKm", () => {
  it("최근 5회 활동의 평균 거리를 계산한다(더 오래된 활동은 무시)", () => {
    const activities = [10, 8, 6, 4, 2, 100].map((d) => activity(d));
    // slice(0, 5) => 10,8,6,4,2 평균 6
    expect(computeTargetDistanceKm(activities)).toBe(6);
  });

  it("활동이 5건 미만이면 있는 만큼만으로 평균을 낸다", () => {
    const activities = [10, 5].map((d) => activity(d));
    expect(computeTargetDistanceKm(activities)).toBe(7.5);
  });

  it("활동이 하나도 없으면 0을 반환한다", () => {
    expect(computeTargetDistanceKm([])).toBe(0);
  });
});

describe("computeExpectedDurationSec", () => {
  it("최근 활동의 평균 페이스와 목표 거리로 예상 소요시간(초)을 계산한다", () => {
    // 목표 거리 5km, 평균 페이스 6분/km => 30분 = 1800초
    const activities = [activity(5, 6), activity(5, 6)];
    expect(computeExpectedDurationSec(activities)).toBe(1800);
  });

  it("활동이 없으면 null을 반환한다", () => {
    expect(computeExpectedDurationSec([])).toBeNull();
  });
});

describe("decideRouteShape", () => {
  it("목표 거리가 충분히 길면 루프를 채택한다", () => {
    expect(decideRouteShape(5)).toEqual({ kind: "loop" });
  });

  it("목표 거리가 너무 짧으면(1.2km 미만) 왕복 코스로 대체한다", () => {
    expect(decideRouteShape(0.8)).toEqual({ kind: "out-and-back" });
  });

  it("목표 거리가 0이면(활동 이력 없음) 루프를 기본값으로 둔다", () => {
    // 0km는 "짧아서 왕복"이 아니라 "아직 표시할 목표가 없다"는 뜻이라 별도 처리 대상이다.
    expect(decideRouteShape(0)).toEqual({ kind: "loop" });
  });
});

describe("resolveStartLocation", () => {
  const home = { lat: 37.5, lng: 127.0 };

  it("위치 권한을 허용하면 실제 위치를 사용한다", () => {
    const outcome: GeolocationOutcome = { status: "success", coords: { lat: 1, lng: 2 } };
    expect(resolveStartLocation(outcome, home)).toEqual({ lat: 1, lng: 2 });
  });

  it("위치 권한을 거부하면 데모 고정 홈 위치를 유지한다", () => {
    const outcome: GeolocationOutcome = { status: "error" };
    expect(resolveStartLocation(outcome, home)).toEqual(home);
  });
});
