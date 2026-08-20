// Turns a runner's own activity history, plus an anonymous peer-group average,
// into five 0-100 scores for a radar chart. Pure and isomorphic on purpose so
// both the server (aggregating peers from seed data) and the client
// (aggregating "my" live seed+upload activities) can share the same math.

export interface RadarSourceActivity {
  date: string; // ISO
  distanceKm: number;
  avgPaceMinPerKm: number;
  avgCadenceSpm: number | null;
  avgHrBpm: number | null;
}

export interface RadarProfileStats {
  avgDistanceKm: number;
  avgPaceMinPerKm: number;
  runsPerWeek: number;
  avgCadenceSpm: number | null;
  avgHrBpm: number | null;
}

export type RadarAxisKey = "endurance" | "speed" | "consistency" | "efficiency" | "recovery";

export interface RadarAxis {
  key: RadarAxisKey;
  label: string;
  mineScore: number;
  peerScore: number;
}

function mean(values: number[]): number {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function meanOrNull(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v != null);
  return present.length > 0 ? mean(present) : null;
}

export function computeRadarStats(activities: RadarSourceActivity[]): RadarProfileStats {
  if (activities.length === 0) {
    return { avgDistanceKm: 0, avgPaceMinPerKm: 0, runsPerWeek: 0, avgCadenceSpm: null, avgHrBpm: null };
  }

  const times = activities.map((a) => new Date(a.date).getTime()).filter(Number.isFinite);
  const spanDays = times.length >= 2 ? (Math.max(...times) - Math.min(...times)) / 86_400_000 : 0;
  const weeks = Math.max(spanDays / 7, 1);

  return {
    avgDistanceKm: mean(activities.map((a) => a.distanceKm)),
    avgPaceMinPerKm: mean(activities.map((a) => a.avgPaceMinPerKm)),
    runsPerWeek: activities.length / weeks,
    avgCadenceSpm: meanOrNull(activities.map((a) => a.avgCadenceSpm)),
    avgHrBpm: meanOrNull(activities.map((a) => a.avgHrBpm)),
  };
}

export function averageRadarStats(list: RadarProfileStats[]): RadarProfileStats {
  if (list.length === 0) {
    return { avgDistanceKm: 0, avgPaceMinPerKm: 0, runsPerWeek: 0, avgCadenceSpm: null, avgHrBpm: null };
  }
  return {
    avgDistanceKm: mean(list.map((s) => s.avgDistanceKm)),
    avgPaceMinPerKm: mean(list.map((s) => s.avgPaceMinPerKm)),
    runsPerWeek: mean(list.map((s) => s.runsPerWeek)),
    avgCadenceSpm: meanOrNull(list.map((s) => s.avgCadenceSpm)),
    avgHrBpm: meanOrNull(list.map((s) => s.avgHrBpm)),
  };
}

function safeInvert(value: number): number {
  return value > 0 ? 1 / value : 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Scores whichever side is better as 100 and the other proportionally lower,
// so the chart always shows a clear "I'm ahead / behind here" read rather
// than an absolute scale that's meaningless with only two points to compare.
function ratioScore(mine: number, peer: number, higherIsBetter: boolean): [number, number] {
  const a = higherIsBetter ? mine : safeInvert(mine);
  const b = higherIsBetter ? peer : safeInvert(peer);
  const max = Math.max(a, b);
  if (max <= 0) return [50, 50];
  return [round1((a / max) * 100), round1((b / max) * 100)];
}

export function buildLevelRadar(mine: RadarProfileStats, peer: RadarProfileStats): RadarAxis[] {
  const [mDist, pDist] = ratioScore(mine.avgDistanceKm, peer.avgDistanceKm, true);
  const [mPace, pPace] = ratioScore(mine.avgPaceMinPerKm, peer.avgPaceMinPerKm, false);
  const [mCons, pCons] = ratioScore(mine.runsPerWeek, peer.runsPerWeek, true);

  const [mCad, pCad] =
    mine.avgCadenceSpm != null && peer.avgCadenceSpm != null
      ? ratioScore(mine.avgCadenceSpm, peer.avgCadenceSpm, true)
      : [50, 50];

  const [mHr, pHr] =
    mine.avgHrBpm != null && peer.avgHrBpm != null
      ? ratioScore(mine.avgHrBpm, peer.avgHrBpm, false)
      : [50, 50];

  return [
    { key: "endurance", label: "지구력", mineScore: mDist, peerScore: pDist },
    { key: "speed", label: "스피드", mineScore: mPace, peerScore: pPace },
    { key: "consistency", label: "꾸준함", mineScore: mCons, peerScore: pCons },
    { key: "efficiency", label: "효율", mineScore: mCad, peerScore: pCad },
    { key: "recovery", label: "회복력", mineScore: mHr, peerScore: pHr },
  ];
}
