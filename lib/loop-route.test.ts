import { describe, expect, it } from "vitest";

import { haversineM } from "@/lib/geo";
import { generateLoopPath, generateOutAndBackPath } from "@/lib/loop-route";

function pathLengthM(path: { lat: number; lng: number }[]): number {
  let sum = 0;
  for (let i = 1; i < path.length; i++) sum += haversineM(path[i - 1], path[i]);
  return sum;
}

const SEOUL = { lat: 37.5107, lng: 127.0139 };

describe("generateLoopPath", () => {
  it("시작점과 끝점이 거의 같은 닫힌 루프를 만든다", () => {
    const path = generateLoopPath(SEOUL, 5);
    const gapM = haversineM(path[0], path[path.length - 1]);
    expect(gapM).toBeLessThan(5); // 시작/끝 지점 오차 5m 미만
  });

  it("실제 경로 길이가 목표 거리에 근접한다(도로망 없이도 항상 성공)", () => {
    const path = generateLoopPath(SEOUL, 5);
    const km = pathLengthM(path) / 1000;
    expect(km).toBeCloseTo(5, 0); // 1km 이내 오차
  });

  it("phaseRad를 다르게 주면 서로 다른 모양(경로)이 나온다", () => {
    const a = generateLoopPath(SEOUL, 5, { phaseRad: 0 });
    const b = generateLoopPath(SEOUL, 5, { phaseRad: Math.PI / 2 });
    expect(a[10]).not.toEqual(b[10]);
  });

  it("목표 거리가 다르면 실제 경로 길이도 그에 비례해 달라진다", () => {
    const short = pathLengthM(generateLoopPath(SEOUL, 2));
    const long = pathLengthM(generateLoopPath(SEOUL, 8));
    expect(long).toBeGreaterThan(short * 2);
  });
});

describe("generateOutAndBackPath", () => {
  it("출발점에서 되돌아와 시작점과 끝점이 같다", () => {
    const path = generateOutAndBackPath(SEOUL, 4);
    expect(path[0]).toEqual(SEOUL);
    const gapM = haversineM(path[0], path[path.length - 1]);
    expect(gapM).toBeLessThan(1);
  });

  it("전체 왕복 거리가 목표 거리와 거의 일치한다", () => {
    const path = generateOutAndBackPath(SEOUL, 4);
    const km = pathLengthM(path) / 1000;
    expect(km).toBeCloseTo(4, 1);
  });
});
