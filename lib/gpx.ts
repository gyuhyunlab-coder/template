// Parses GPX 1.1 track files (with the Garmin TrackPointExtension for
// cadence/heart rate) into the summary an activity record needs. Deliberately
// regex-based instead of a DOM parser: the app only ever reads the trkpt
// fields it cares about, and this runs identically on the server (Node) and
// in tests without a DOMParser dependency.

import { haversineM, type LatLng } from "@/lib/geo";

export type GpxLatLng = LatLng;

export interface ParsedActivity {
  distanceKm: number;
  durationSec: number;
  avgPaceMinPerKm: number;
  avgCadenceSpm: number | null;
  avgHrBpm: number | null;
  startTime: string | null;
  path: GpxLatLng[];
}

export type GpxParseResult =
  | { ok: true; activity: ParsedActivity }
  | { ok: false; error: string };

const TRKPT_RE = /<trkpt\s+lat="([^"]*)"\s+lon="([^"]*)">([\s\S]*?)<\/trkpt>/g;

export function parseGpx(xml: string): GpxParseResult {
  if (!xml || !xml.includes("<gpx")) {
    return { ok: false, error: "GPX 파일이 아닙니다." };
  }

  const path: GpxLatLng[] = [];
  const times: string[] = [];
  const hrValues: number[] = [];
  const cadValues: number[] = [];

  let match: RegExpExecArray | null;
  TRKPT_RE.lastIndex = 0;
  while ((match = TRKPT_RE.exec(xml))) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { ok: false, error: "유효하지 않은 위치 좌표가 포함되어 있습니다." };
    }
    path.push({ lat, lng });

    const body = match[3];
    const time = body.match(/<time>([^<]+)<\/time>/);
    if (time) times.push(time[1]);
    const hr = body.match(/<gpxtpx:hr>([^<]+)<\/gpxtpx:hr>/);
    if (hr) {
      const v = parseFloat(hr[1]);
      if (Number.isFinite(v)) hrValues.push(v);
    }
    const cad = body.match(/<gpxtpx:cad>([^<]+)<\/gpxtpx:cad>/);
    if (cad) {
      const v = parseFloat(cad[1]);
      if (Number.isFinite(v)) cadValues.push(v);
    }
  }

  if (path.length < 2) {
    return { ok: false, error: "경로 포인트가 2개 미만이라 활동으로 볼 수 없습니다." };
  }

  let distanceM = 0;
  for (let i = 1; i < path.length; i++) distanceM += haversineM(path[i - 1], path[i]);
  const distanceKm = distanceM / 1000;

  let durationSec = 0;
  if (times.length >= 2) {
    const start = Date.parse(times[0]);
    const end = Date.parse(times[times.length - 1]);
    if (Number.isFinite(start) && Number.isFinite(end)) {
      durationSec = Math.max(0, (end - start) / 1000);
    }
  }

  const avgPaceMinPerKm =
    distanceKm > 0 && durationSec > 0 ? durationSec / 60 / distanceKm : 0;

  const avgHrBpm = hrValues.length
    ? hrValues.reduce((a, b) => a + b, 0) / hrValues.length
    : null;
  const avgCadenceSpm = cadValues.length
    ? cadValues.reduce((a, b) => a + b, 0) / cadValues.length
    : null;

  return {
    ok: true,
    activity: {
      distanceKm,
      durationSec,
      avgPaceMinPerKm,
      avgCadenceSpm,
      avgHrBpm,
      startTime: times[0] ?? null,
      path,
    },
  };
}
