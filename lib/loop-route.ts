// 라우팅 API 없이 순수 기하학만으로 "뛸만해 보이는" 경로를 만든다. 예전에는
// 매끈한 사인 곡선으로 뭉뚱그렸지만, 실제 도로는 직선 구간과 90도 코너로
// 이뤄지므로 직사각형 블록 루프(직선 변 + 코너)로 바꿨다. 같은 프로필의 여러
// 루프가 같은 bearingDeg를 공유하면 서로 다른 앵커에서 출발해도 변의 방향이
// 맞아 겹치는 구간이 생기고, 그 구간이 히트맵에서 밝게 빛나는 "거리"처럼 보인다.
import { destinationPoint, haversineM, offsetLatLng, type LatLng } from "@/lib/geo";

export interface LoopPathOptions {
  pointCount?: number;
  phaseRad?: number;
}

export interface GridLoopOptions extends LoopPathOptions {
  bearingDeg?: number;
  aspectMin?: number;
  aspectMax?: number;
}

interface Offset {
  north: number;
  east: number;
}

function rotate(north: number, east: number, rad: number): Offset {
  return {
    north: north * Math.cos(rad) - east * Math.sin(rad),
    east: north * Math.sin(rad) + east * Math.cos(rad),
  };
}

function rectangleCorners(w: number, h: number): Offset[] {
  const halfW = w / 2;
  const halfH = h / 2;
  return [
    { north: halfH, east: halfW },
    { north: -halfH, east: halfW },
    { north: -halfH, east: -halfW },
    { north: halfH, east: -halfW },
    { north: halfH, east: halfW },
  ];
}

function sampleClosedPolygon(
  center: LatLng,
  corners: Offset[],
  rotationRad: number,
  pointCount: number
): LatLng[] {
  const sideLengths = corners
    .slice(0, -1)
    .map((c, i) => Math.hypot(corners[i + 1].north - c.north, corners[i + 1].east - c.east));
  const perimeter = sideLengths.reduce((a, b) => a + b, 0);

  const points: LatLng[] = [];
  for (let i = 0; i <= pointCount; i++) {
    const s = (i / pointCount) * perimeter;
    let acc = 0;
    let side = 0;
    while (side < sideLengths.length - 1 && s > acc + sideLengths[side]) {
      acc += sideLengths[side];
      side++;
    }
    const segLen = sideLengths[side] || 1;
    const t = (s - acc) / segLen;
    const p0 = corners[side];
    const p1 = corners[side + 1];
    const north = p0.north + (p1.north - p0.north) * t;
    const east = p0.east + (p1.east - p0.east) * t;
    const rotated = rotate(north, east, rotationRad);
    points.push(offsetLatLng(center, rotated.north, rotated.east));
  }
  return points;
}

// 직사각형 블록 루프를 만들고(둘레 ≈ targetDistanceKm), 코너 포함 전체 둘레를
// 호 길이 기준으로 균등 샘플링한다 — 페이스/심박 같은 시계열 값이 변·코너
// 구분 없이 매끄럽게 이어지도록.
export function generateGridLoopPath(
  center: LatLng,
  targetDistanceKm: number,
  options: GridLoopOptions = {}
): LatLng[] {
  const pointCount = options.pointCount ?? 72;
  const phase = options.phaseRad ?? 0;
  const aspectMin = options.aspectMin ?? 1.0;
  const aspectMax = options.aspectMax ?? 1.9;
  // 회전은 bearingDeg로만 정한다 — phase는 가로세로 비율만 흔든다. 시드
  // 생성기가 같은 프로필의 여러 런에 같은 bearingDeg를 넘기는 이유가 바로
  // 이것: phase(런마다 무작위)가 회전까지 흔들면 매번 방향이 달라져서 절대
  // 겹치지 않는 히트맵이 나온다.
  const rotationRad = ((options.bearingDeg ?? 0) * Math.PI) / 180;
  const ratio = aspectMin + ((aspectMax - aspectMin) * (Math.sin(phase) + 1)) / 2;

  const targetM = targetDistanceKm * 1000;
  const guessH = targetM / (2 * (ratio + 1));
  const guessW = ratio * guessH;

  const rawPoints = sampleClosedPolygon(center, rectangleCorners(guessW, guessH), rotationRad, pointCount);
  let length = 0;
  for (let i = 1; i < rawPoints.length; i++) length += haversineM(rawPoints[i - 1], rawPoints[i]);

  const scale = length > 0 ? targetM / length : 1;
  return sampleClosedPolygon(
    center,
    rectangleCorners(guessW * scale, guessH * scale),
    rotationRad,
    pointCount
  );
}

export function generateLoopPath(
  center: LatLng,
  targetDistanceKm: number,
  options: LoopPathOptions = {}
): LatLng[] {
  return generateGridLoopPath(center, targetDistanceKm, options);
}

export function generateOutAndBackPath(
  start: LatLng,
  targetDistanceKm: number,
  bearingDeg = 45,
  legPoints = 20
): LatLng[] {
  const turnaround = destinationPoint(start, (targetDistanceKm * 1000) / 2, bearingDeg);
  const there: LatLng[] = [];
  for (let i = 0; i <= legPoints; i++) {
    const t = i / legPoints;
    there.push({
      lat: start.lat + (turnaround.lat - start.lat) * t,
      lng: start.lng + (turnaround.lng - start.lng) * t,
    });
  }
  const back = [...there].slice(0, -1).reverse();
  return [...there, ...back];
}
