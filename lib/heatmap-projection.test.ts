import { describe, expect, it } from "vitest";

import { projectPaths, type LatLng } from "@/lib/heatmap-projection";

describe("projectPaths", () => {
  it("빈 경로 배열을 넣으면 각 경로에 대해 빈 배열을 반환한다", () => {
    const result = projectPaths([[], []], { width: 400, height: 300 });
    expect(result).toEqual([[], []]);
  });

  it("각 경로의 포인트 개수와 순서를 그대로 보존한다", () => {
    const pathA: LatLng[] = [
      { lat: 37.5, lng: 127.0 },
      { lat: 37.51, lng: 127.01 },
      { lat: 37.52, lng: 127.0 },
    ];
    const pathB: LatLng[] = [
      { lat: 37.49, lng: 126.99 },
      { lat: 37.48, lng: 126.98 },
    ];
    const result = projectPaths([pathA, pathB], { width: 400, height: 300 });
    expect(result[0]).toHaveLength(3);
    expect(result[1]).toHaveLength(2);
  });

  it("모든 투영된 점이 padding을 감안한 경계 상자 안에 들어온다", () => {
    const path: LatLng[] = [
      { lat: 37.5, lng: 127.0 },
      { lat: 37.55, lng: 127.05 },
      { lat: 37.45, lng: 126.95 },
      { lat: 37.5, lng: 126.9 },
    ];
    const width = 500;
    const height = 350;
    const padding = 16;
    const [projected] = projectPaths([path], { width, height, padding });
    for (const p of projected) {
      expect(p.x).toBeGreaterThanOrEqual(padding - 1e-6);
      expect(p.x).toBeLessThanOrEqual(width - padding + 1e-6);
      expect(p.y).toBeGreaterThanOrEqual(padding - 1e-6);
      expect(p.y).toBeLessThanOrEqual(height - padding + 1e-6);
    }
  });

  it("포인트가 하나뿐이거나 모두 같은 좌표여도 나눗셈 오류 없이 유한한 좌표를 반환한다", () => {
    const single: LatLng[] = [{ lat: 37.5, lng: 127.0 }];
    const identical: LatLng[] = [
      { lat: 37.5, lng: 127.0 },
      { lat: 37.5, lng: 127.0 },
    ];
    const [a, b] = projectPaths([single, identical], { width: 400, height: 300 });
    for (const p of [...a, ...b]) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });

  it("위도가 클수록(북쪽) 화면 y좌표가 더 작다(위쪽에 그려진다)", () => {
    const path: LatLng[] = [
      { lat: 37.4, lng: 127.0 }, // 남쪽
      { lat: 37.6, lng: 127.0 }, // 북쪽
    ];
    const [projected] = projectPaths([path], { width: 400, height: 300 });
    const [south, north] = projected;
    expect(north.y).toBeLessThan(south.y);
  });

  it("강변형(좁고 긴) 경로는 투영 후에도 한쪽 축으로 치우친 형태를 유지한다", () => {
    // 위도로 넓게(약 2.2km), 경도로 아주 좁게(약 110m) 퍼진 강변 트랙 형태
    const river: LatLng[] = Array.from({ length: 20 }, (_, i) => ({
      lat: 37.5 + i * 0.002,
      lng: 127.0 + (i % 2 === 0 ? 0 : 0.001),
    }));
    const [projected] = projectPaths([river], { width: 400, height: 400, padding: 16 });
    const xs = projected.map((p) => p.x);
    const ys = projected.map((p) => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    // 실제 위경도 스팬 비율(위도 2.2km : 경도 110m ≈ 20:1)이 화면에서도 좁고 긴 형태로 보여야 한다.
    expect(spanY).toBeGreaterThan(spanX * 5);
  });

  it("여러 경로가 하나의 공유 경계 상자를 기준으로 함께 투영된다(경로별로 다시 스케일하지 않는다)", () => {
    const near: LatLng[] = [
      { lat: 37.5, lng: 127.0 },
      { lat: 37.5001, lng: 127.0001 },
    ];
    const far: LatLng[] = [
      { lat: 37.5, lng: 127.0 },
      { lat: 37.6, lng: 127.1 },
    ];
    const [projNear, projFar] = projectPaths([near, far], { width: 400, height: 400 });
    const nearSpan = Math.hypot(
      projNear[1].x - projNear[0].x,
      projNear[1].y - projNear[0].y,
    );
    const farSpan = Math.hypot(projFar[1].x - projFar[0].x, projFar[1].y - projFar[0].y);
    // far 경로가 실제로 훨씬 더 멀리 떨어져 있으므로, 공유 스케일 하에서 화면 상 거리도 훨씬 크다.
    expect(farSpan).toBeGreaterThan(nearSpan * 10);
  });
});
