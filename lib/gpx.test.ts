import { describe, expect, it } from "vitest";

import { parseGpx } from "@/lib/gpx";

const GPX_HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk><trkseg>`;
const GPX_FOOTER = `  </trkseg></trk></gpx>`;

function trkpt(
  lat: number,
  lon: number,
  time: string,
  opts?: { hr?: number; cad?: number }
) {
  const ext =
    opts?.hr != null || opts?.cad != null
      ? `<extensions><gpxtpx:TrackPointExtension>${
          opts.hr != null ? `<gpxtpx:hr>${opts.hr}</gpxtpx:hr>` : ""
        }${opts.cad != null ? `<gpxtpx:cad>${opts.cad}</gpxtpx:cad>` : ""}</gpxtpx:TrackPointExtension></extensions>`
      : "";
  return `<trkpt lat="${lat}" lon="${lon}"><time>${time}</time>${ext}</trkpt>`;
}

// three points, ~500m apart each (0.0044915 deg of latitude), 5 minutes apart:
// 1.0km total over 10 minutes = 10:00/km pace.
const THREE_POINTS = [
  trkpt(37.5, 127.0, "2026-01-01T06:00:00Z", { hr: 140, cad: 160 }),
  trkpt(37.5044915, 127.0, "2026-01-01T06:05:00Z", { hr: 150, cad: 165 }),
  trkpt(37.508983, 127.0, "2026-01-01T06:10:00Z", { hr: 160, cad: 170 }),
];

describe("parseGpx", () => {
  it("트랙 포인트로부터 거리·시간·페이스·케이던스·심박을 계산한다", () => {
    const xml = `${GPX_HEADER}${THREE_POINTS.join("")}${GPX_FOOTER}`;
    const result = parseGpx(xml);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.activity.distanceKm).toBeCloseTo(1.0, 1);
    expect(result.activity.durationSec).toBe(600);
    expect(result.activity.avgPaceMinPerKm).toBeCloseTo(10, 1);
    expect(result.activity.avgHrBpm).toBe(150);
    expect(result.activity.avgCadenceSpm).toBe(165);
    expect(result.activity.path).toHaveLength(3);
  });

  it("심박·케이던스 확장 필드가 없어도 나머지 값은 정상 계산한다", () => {
    const points = [
      trkpt(37.5, 127.0, "2026-01-01T06:00:00Z"),
      trkpt(37.5044915, 127.0, "2026-01-01T06:05:00Z"),
    ];
    const xml = `${GPX_HEADER}${points.join("")}${GPX_FOOTER}`;
    const result = parseGpx(xml);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.activity.distanceKm).toBeGreaterThan(0);
    expect(result.activity.avgHrBpm).toBeNull();
    expect(result.activity.avgCadenceSpm).toBeNull();
  });

  it("좌표가 숫자가 아니면 오류를 반환하고 기존 데이터에 영향을 주지 않는다", () => {
    const xml = `${GPX_HEADER}<trkpt lat="not-a-number" lon="127"><time>2026-01-01T06:00:00Z</time></trkpt>${GPX_FOOTER}`;
    const result = parseGpx(xml);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/좌표/);
  });

  it("GPX 형식이 아닌 파일은 오류를 반환한다", () => {
    const result = parseGpx("this is not xml at all");
    expect(result.ok).toBe(false);
  });

  it("트랙 포인트가 1개 이하면 오류를 반환한다", () => {
    const xml = `${GPX_HEADER}${trkpt(37.5, 127.0, "2026-01-01T06:00:00Z")}${GPX_FOOTER}`;
    const result = parseGpx(xml);
    expect(result.ok).toBe(false);
  });
});
