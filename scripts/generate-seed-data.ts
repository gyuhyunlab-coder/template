// Generates synthetic GPX seed data for the running-art-dashboard spec.
// Run with: bun run scripts/generate-seed-data.ts
import fs from "node:fs";
import path from "node:path";
import { offsetLatLng } from "@/lib/geo";
import { generateGridLoopPath } from "@/lib/loop-route";

type Gender = "M" | "F";

interface Terrain {
  baseElevationM: number;
  amplitudeM: number;
}

type PathShape = "river" | "blob";

interface Profile {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  ageBand: string;
  home: { lat: number; lng: number; label: string };
  terrain: Terrain;
  baselinePaceMinPerKm: number;
  baselineDistanceKm: number;
  weeklyPattern: number[]; // 0=Sun .. 6=Sat
  longRunWeekday: number;
  // "river": narrow elongated block loop along a riverside/greenway so it
  // never crosses the water. "blob": squarer block loop around an anchor
  // point. 두 경우 모두 이제 직사각형 블록 도형(lib/loop-route.ts)을 쓰고,
  // bearingDeg는 그 프로필의 "동네 그리드" 방향을 고정한다 — 같은 프로필의
  // 서로 다른 런이 같은 방향의 변을 공유해야 히트맵에서 겹치는 구간이 생긴다.
  pathShape: PathShape;
  bearingDeg: number;
}

const ageBand = (age: number) => `${Math.floor(age / 10) * 10}대`;

// Ages are clustered so the 10-year + gender leaderboard buckets have real
// competition (20대F x3, 30대M x3, 40대F x2, 50대M x2) instead of 6 lonely
// singles, per the reviewed roster.
const PROFILES: Profile[] = [
  {
    id: "jung-haeun",
    name: "정하은",
    gender: "F",
    age: 24,
    ageBand: ageBand(24),
    home: { lat: 37.5107, lng: 127.0139, label: "반포한강공원" },
    terrain: { baseElevationM: 15, amplitudeM: 3 },
    baselinePaceMinPerKm: 6.3,
    baselineDistanceKm: 5.5,
    weeklyPattern: [1, 3, 5, 6],
    longRunWeekday: 6,
    pathShape: "river",
    bearingDeg: 100,
  },
  {
    id: "kim-doyoon",
    name: "김도윤",
    gender: "M",
    age: 39,
    ageBand: ageBand(39),
    home: { lat: 37.5445, lng: 127.0374, label: "서울숲" },
    terrain: { baseElevationM: 25, amplitudeM: 8 },
    baselinePaceMinPerKm: 5.4,
    baselineDistanceKm: 7.0,
    weeklyPattern: [2, 4, 6],
    longRunWeekday: 6,
    pathShape: "blob",
    bearingDeg: 15,
  },
  {
    id: "park-seoyeon",
    name: "박서연",
    gender: "F",
    age: 27,
    ageBand: ageBand(27),
    home: { lat: 37.5219, lng: 127.1219, label: "올림픽공원" },
    terrain: { baseElevationM: 40, amplitudeM: 12 },
    baselinePaceMinPerKm: 5.9,
    baselineDistanceKm: 6.2,
    weeklyPattern: [1, 3, 5, 0],
    longRunWeekday: 0,
    pathShape: "blob",
    bearingDeg: 70,
  },
  {
    id: "lee-junho",
    name: "이준호",
    gender: "M",
    age: 32,
    ageBand: ageBand(32),
    home: { lat: 37.5283, lng: 126.9325, label: "여의도한강공원" },
    terrain: { baseElevationM: 10, amplitudeM: 2 },
    baselinePaceMinPerKm: 5.0,
    baselineDistanceKm: 9.0,
    weeklyPattern: [1, 3, 5, 6],
    longRunWeekday: 6,
    pathShape: "river",
    bearingDeg: 95,
  },
  {
    id: "choi-yujin",
    name: "최유진",
    gender: "F",
    age: 29,
    ageBand: ageBand(29),
    home: { lat: 37.5511, lng: 126.9882, label: "남산" },
    terrain: { baseElevationM: 60, amplitudeM: 25 },
    baselinePaceMinPerKm: 6.6,
    baselineDistanceKm: 4.8,
    weeklyPattern: [2, 4, 0],
    longRunWeekday: 0,
    pathShape: "blob",
    bearingDeg: 100,
  },
  {
    id: "kang-minseok",
    name: "강민석",
    gender: "M",
    age: 36,
    ageBand: ageBand(36),
    home: { lat: 37.5447, lng: 127.0557, label: "뚝섬한강공원" },
    terrain: { baseElevationM: 12, amplitudeM: 3 },
    baselinePaceMinPerKm: 5.2,
    baselineDistanceKm: 8.0,
    weeklyPattern: [1, 2, 4, 6],
    longRunWeekday: 6,
    pathShape: "river",
    bearingDeg: 80,
  },
  {
    id: "han-jisoo",
    name: "한지수",
    gender: "F",
    age: 42,
    ageBand: ageBand(42),
    home: { lat: 37.5372, lng: 126.8378, label: "안양천" },
    terrain: { baseElevationM: 8, amplitudeM: 2 },
    baselinePaceMinPerKm: 6.8,
    baselineDistanceKm: 4.2,
    weeklyPattern: [1, 4, 6],
    longRunWeekday: 6,
    pathShape: "river",
    bearingDeg: 10,
  },
  {
    id: "oh-taeyang",
    name: "오태양",
    gender: "M",
    age: 52,
    ageBand: ageBand(52),
    home: { lat: 37.6207, lng: 127.0623, label: "북서울꿈의숲" },
    terrain: { baseElevationM: 45, amplitudeM: 15 },
    baselinePaceMinPerKm: 5.7,
    baselineDistanceKm: 7.5,
    weeklyPattern: [1, 3, 5, 0],
    longRunWeekday: 0,
    pathShape: "blob",
    bearingDeg: 40,
  },
  {
    id: "seo-youngran",
    name: "서영란",
    gender: "F",
    age: 47,
    ageBand: ageBand(47),
    home: { lat: 37.5133, lng: 127.1028, label: "잠실종합운동장" },
    terrain: { baseElevationM: 18, amplitudeM: 4 },
    baselinePaceMinPerKm: 7.2,
    baselineDistanceKm: 3.8,
    weeklyPattern: [2, 5, 0],
    longRunWeekday: 0,
    pathShape: "blob",
    bearingDeg: 55,
  },
  {
    id: "bae-gichul",
    name: "배기철",
    gender: "M",
    age: 58,
    ageBand: ageBand(58),
    home: { lat: 37.6558, lng: 127.0764, label: "경춘선숲길" },
    terrain: { baseElevationM: 55, amplitudeM: 18 },
    baselinePaceMinPerKm: 6.9,
    baselineDistanceKm: 4.5,
    weeklyPattern: [1, 3, 6],
    longRunWeekday: 6,
    pathShape: "river",
    bearingDeg: 50,
  },
];

// "recent 3 months" is always relative to when the script actually runs, so
// the weekly/monthly leaderboard windows never age out of the generated data.
const TODAY = new Date();
const WINDOW_DAYS = 90;
const START = new Date(TODAY.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

let randState = 42;
function rand(): number {
  // deterministic LCG so re-runs reproduce the same shapes/distances
  randState = (randState * 1103515245 + 12345) & 0x7fffffff;
  return randState / 0x7fffffff;
}
function randRange(min: number, max: number): number {
  return min + rand() * (max - min);
}

interface TrackPoint {
  lat: number;
  lng: number;
  eleM: number;
  paceMinPerKm: number;
  cadenceSpm: number;
  hrBpm: number;
}

// Picks where this run's loop is centered. A single shared center for every
// run of a profile draws a bullseye when routes are overlaid; anchoring each
// run at a different point near home spreads the heatmap the way a real
// runner's routes fan out. River/greenway profiles only slide the anchor
// along the waterway's bearing so the loop never drifts across the water.
// blob 프로필은 앵커의 방향·거리를 몇 가지 값으로 양자화한다 — 그래야 여러
// 런이 같은 앵커를 반복해서 쓰게 되고, 그 반복이 히트맵에서 겹치는 "거리"처럼
// 보인다. 매번 완전히 무작위한 각도로 흩어지면 절대 겹치지 않는다.
function pickAnchor(
  home: { lat: number; lng: number },
  pathShape: PathShape,
  bearingDeg: number
): { lat: number; lng: number } {
  const bearingBase = (bearingDeg * Math.PI) / 180;
  if (pathShape === "river") {
    const along = randRange(-700, 700);
    const north = along * Math.cos(bearingBase);
    const east = along * Math.sin(bearingBase);
    return offsetLatLng(home, north, east);
  }
  const dirSteps = 8;
  const dirIndex = Math.floor(rand() * dirSteps);
  const bearing = bearingBase + (dirIndex / dirSteps) * Math.PI * 2;
  const distSteps = [300, 500, 800];
  const dist = distSteps[Math.floor(rand() * distSteps.length)];
  return offsetLatLng(home, dist * Math.cos(bearing), dist * Math.sin(bearing));
}

function buildLoop(
  center: { lat: number; lng: number },
  terrain: Terrain,
  targetDistanceKm: number,
  pointCount: number,
  avgPaceMinPerKm: number,
  pathShape: PathShape,
  bearingDeg: number
): TrackPoint[] {
  const phase = randRange(0, Math.PI * 2);
  const phase2 = randRange(0, Math.PI * 2);
  const paceRidePhase = randRange(0, Math.PI * 2);

  // 도형 자체(직사각형 블록 루프)는 lib/loop-route.ts와 공유한다 — 추천 경로
  // 화면이 그리는 것과 같은 방식이라 히트맵과 추천 경로가 같은 "느낌"을 준다.
  // river는 폭이 좁고 긴 직사각형(강변 그린웨이), blob은 정사각형에 가까운
  // 블록으로 구분한다.
  const shapePoints =
    pathShape === "river"
      ? generateGridLoopPath(center, targetDistanceKm, {
          pointCount,
          phaseRad: phase,
          bearingDeg,
          aspectMin: 8,
          aspectMax: 10,
        })
      : generateGridLoopPath(center, targetDistanceKm, {
          pointCount,
          phaseRad: phase,
          bearingDeg,
          aspectMin: 1.0,
          aspectMax: 1.8,
        });

  const points: TrackPoint[] = [];
  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount;
    const theta = t * Math.PI * 2;
    const { lat, lng } = shapePoints[i];
    const eleM =
      terrain.baseElevationM +
      terrain.amplitudeM * Math.sin(2 * theta + phase2) +
      randRange(-1, 1);

    const slopeFactor = Math.max(0, Math.sin(2 * theta + phase2)); // uphill half of the sine
    const paceWobble = 0.06 * Math.sin(3 * theta + paceRidePhase) + randRange(-0.03, 0.03);
    const paceMinPerKm = avgPaceMinPerKm * (1 + paceWobble) + slopeFactor * 0.35;

    const cadenceSpm = Math.min(
      190,
      Math.max(150, 150 + (6.5 - paceMinPerKm) * 14 + randRange(-3, 3))
    );

    const drift = 6 * t; // cardiac drift over the run
    const hrBpm = Math.min(
      188,
      Math.max(112, 128 + drift + (6.5 - paceMinPerKm) * 9 + randRange(-4, 4))
    );

    points.push({ lat, lng, eleM, paceMinPerKm, cadenceSpm, hrBpm });
  }
  return points;
}

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}
function isoDate(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function isoTime(d: Date) {
  return d.toISOString().replace(/\.\d+Z$/, "Z");
}

function buildGpx(
  profile: Profile,
  date: Date,
  points: TrackPoint[],
  intervalSec: number,
  includeExtensions: boolean
): string {
  const startTime = new Date(date);
  startTime.setUTCHours(6 + Math.floor(rand() * 12), Math.floor(rand() * 60), 0, 0);

  const trkpts = points
    .map((p, i) => {
      const t = new Date(startTime.getTime() + i * intervalSec * 1000);
      const ext = includeExtensions
        ? `\n        <extensions>\n          <gpxtpx:TrackPointExtension>\n            <gpxtpx:hr>${Math.round(
            p.hrBpm
          )}</gpxtpx:hr>\n            <gpxtpx:cad>${Math.round(
            p.cadenceSpm
          )}</gpxtpx:cad>\n          </gpxtpx:TrackPointExtension>\n        </extensions>`
        : "";
      return `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}">\n        <ele>${p.eleM.toFixed(
        1
      )}</ele>\n        <time>${isoTime(t)}</time>${ext}\n      </trkpt>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="running-art-dashboard-seed-generator"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <time>${isoTime(startTime)}</time>
  </metadata>
  <trk>
    <name>${profile.name} - ${isoDate(date)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

function generateProfileActivities(profile: Profile) {
  const outDir = path.join("data", "seed", "activities", profile.id);
  fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((TODAY.getTime() - START.getTime()) / dayMs);

  for (let d = 0; d <= totalDays; d++) {
    const date = new Date(START.getTime() + d * dayMs);
    const weekday = date.getUTCDay();
    const progress = Math.min(1, d / totalDays); // 0 -> 1 over the window

    const isPatternDay = profile.weeklyPattern.includes(weekday);
    const isBonusDay = !isPatternDay && rand() < 0.05;
    if (!isPatternDay && !isBonusDay) continue;
    if (isPatternDay && rand() < 0.1) continue; // occasional skip

    const isLongRun = weekday === profile.longRunWeekday && isPatternDay;
    const paceImprovement = 1 - 0.07 * progress; // gets slightly faster over 3 months
    const avgPace = profile.baselinePaceMinPerKm * paceImprovement * randRange(0.97, 1.03);

    const distanceMultiplier = isLongRun ? randRange(1.35, 1.6) : randRange(0.85, 1.15);
    const capacityGrowth = 1 + 0.12 * progress;
    const distanceKm = Math.max(
      2,
      profile.baselineDistanceKm * capacityGrowth * distanceMultiplier
    );

    const durationSec = distanceKm * avgPace * 60;
    const intervalSec = 20;
    const pointCount = Math.max(30, Math.min(400, Math.round(durationSec / intervalSec)));

    const anchor = pickAnchor(profile.home, profile.pathShape, profile.bearingDeg);
    const points = buildLoop(
      anchor,
      profile.terrain,
      distanceKm,
      pointCount,
      avgPace,
      profile.pathShape,
      profile.bearingDeg
    );
    const includeExtensions = rand() > 0.08; // ~8% of runs omit cadence/HR extensions

    const gpx = buildGpx(profile, date, points, intervalSec, includeExtensions);
    const fileName = `${isoDate(date)}.gpx`;
    fs.writeFileSync(path.join(outDir, fileName), gpx, "utf-8");
    count++;
  }
  return count;
}

function writeInvalidSample() {
  const dir = path.join("data", "seed", "invalid-samples");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "broken.gpx"),
    "<?xml version=\"1.0\"?>\n<gpx><trk><trkseg><trkpt lat=\"not-a-number\" lon=\"127\">\n",
    "utf-8"
  );
}

function main() {
  fs.mkdirSync(path.join("data", "seed"), { recursive: true });

  const profilesOut = PROFILES.map(
    ({
      terrain,
      weeklyPattern,
      longRunWeekday,
      baselinePaceMinPerKm,
      baselineDistanceKm,
      pathShape,
      bearingDeg,
      ...rest
    }) => rest
  );
  fs.writeFileSync(
    path.join("data", "seed", "profiles.json"),
    JSON.stringify(profilesOut, null, 2),
    "utf-8"
  );

  let total = 0;
  for (const profile of PROFILES) {
    const n = generateProfileActivities(profile);
    total += n;
    console.log(`${profile.name} (${profile.id}): ${n}건`);
  }
  writeInvalidSample();
  console.log(`총 ${total}건 생성 완료 (data/seed/activities/**)`);
}

main();
