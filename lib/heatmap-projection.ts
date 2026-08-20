// 여러 활동의 GPS 경로(위도/경도)를 하나의 SVG 좌표계에 투영하기 위한 순수 함수.
// 모든 경로를 합친 하나의 경계 상자(bounding box)에 맞춰 정규 위경도 투영(equirectangular)을
// 적용한다. 화면 표시용 상대 위치만 맞추면 되므로 lib/gpx.ts의 haversineM처럼 정밀한 측지
// 거리 계산까지는 필요 없지만, 위도에 따른 경도 압축(cos(lat))은 그대로 반영해 강변형(좁고 긴)과
// 공원형(방사형) 경로의 실제 종횡비가 화면에서도 유지되게 한다.

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
}

export interface HeatmapProjectionOptions {
  width: number;
  height: number;
  /** 경계 상자 바깥 여백(px). 기본값 16. */
  padding?: number;
}

const METERS_PER_DEG_LAT = 111_320;

/**
 * 위경도 좌표들을 중심점 기준의 평면 미터 단위 좌표로 변환한다.
 * lng 방향은 cos(중심 위도)로 압축해 실제 거리 비율(종횡비)을 보존한다.
 */
function toMeters(points: LatLng[], centerLat: number, centerLng: number): ProjectedPoint[] {
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  return points.map((p) => ({
    x: (p.lng - centerLng) * metersPerDegLng,
    y: (p.lat - centerLat) * METERS_PER_DEG_LAT,
  }));
}

/**
 * 여러 경로(paths)를 입력 순서와 각 경로의 포인트 개수를 그대로 유지한 채, 공유하는 하나의
 * 경계 상자에 맞춰 SVG 좌표(x: 0..width, y: 0..height, y는 아래로 증가)로 투영한다.
 * 포인트가 전혀 없으면 빈 배열의 배열을 반환한다.
 */
export function projectPaths(
  paths: LatLng[][],
  { width, height, padding = 16 }: HeatmapProjectionOptions,
): ProjectedPoint[][] {
  const allPoints = paths.flat();
  if (allPoints.length === 0) return paths.map(() => []);

  const centerLat =
    allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
  const centerLng =
    allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;

  const metersPaths = paths.map((path) => toMeters(path, centerLat, centerLng));
  const flatMeters = metersPaths.flat();

  const minX = Math.min(...flatMeters.map((p) => p.x));
  const maxX = Math.max(...flatMeters.map((p) => p.x));
  const minY = Math.min(...flatMeters.map((p) => p.y));
  const maxY = Math.max(...flatMeters.map((p) => p.y));

  const usableW = Math.max(width - padding * 2, 1);
  const usableH = Math.max(height - padding * 2, 1);
  const spanX = maxX - minX;
  const spanY = maxY - minY;

  // 경로가 한 점뿐이거나(spanX/Y === 0) 완전히 평평한 경우 나눗셈으로 터지지 않도록
  // 스케일을 usableW/H 자체로 대체해(사실상 1) 중앙에 점 하나로 수렴시킨다.
  const scale = Math.min(
    spanX > 0 ? usableW / spanX : usableW,
    spanY > 0 ? usableH / spanY : usableH,
  );

  const contentW = spanX * scale;
  const contentH = spanY * scale;
  const offsetX = (width - contentW) / 2;
  const offsetY = (height - contentH) / 2;

  return metersPaths.map((points) =>
    points.map((p) => ({
      x: offsetX + (p.x - minX) * scale,
      y: height - offsetY - (p.y - minY) * scale, // 위도가 클수록(북쪽) 화면 위쪽(y 작음)
    })),
  );
}
