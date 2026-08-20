// 추천 경로 화면(components/dashboard/route-recommendation-view.tsx)이 쓰는 순수
// 로직만 모아둔 파일이다. 실제 지도 렌더링(Naver Maps)은 컴포넌트 안에서 이
// 함수들의 결과를 가지고 수행하며, 여기 있는 함수들은 브라우저 API 없이도 단위
// 테스트가 가능하도록 분리했다.
import type { LatLng } from "@/lib/geo";

export type { LatLng };

// 최근 5회 활동의 평균 거리를 목표 거리로 삼는다(스펙의 확정된 제약).
// 활동이 5건 미만이면 있는 만큼만으로 평균을 낸다. 활동이 하나도 없으면 0을 반환한다.
export function computeTargetDistanceKm(activities: { distanceKm: number }[]): number {
  const recent = activities.slice(0, 5);
  if (recent.length === 0) return 0;
  const sum = recent.reduce((acc, activity) => acc + activity.distanceKm, 0);
  return sum / recent.length;
}

// 같은 최근 5회 활동의 평균 페이스로 예상 소요시간(초)을 어림잡는다.
// 페이스 정보가 없거나 목표 거리가 0이면 null(표시 불가)을 반환한다.
export function computeExpectedDurationSec(activities: { distanceKm: number; avgPaceMinPerKm: number }[]): number | null {
  const recent = activities.slice(0, 5).filter((a) => Number.isFinite(a.avgPaceMinPerKm) && a.avgPaceMinPerKm > 0);
  if (recent.length === 0) return null;
  const avgPaceMinPerKm = recent.reduce((acc, a) => acc + a.avgPaceMinPerKm, 0) / recent.length;
  const targetDistanceKm = computeTargetDistanceKm(activities);
  if (targetDistanceKm <= 0) return null;
  return Math.round(avgPaceMinPerKm * targetDistanceKm * 60);
}

export type RouteShapeDecision = { kind: "loop" } | { kind: "out-and-back" };

// 목표 거리가 이보다 짧으면 루프 모양이 부자연스럽게 작아져서(거의 제자리를 도는
// 모양) 왕복 코스로 대체한다. 경로는 도로망 API가 아니라 우리가 직접 그리는
// 기하학적 도형이라 "루프 생성 실패"가 없다 — 그래서 판단 기준을 API 응답
// 성공/실패가 아니라 목표 거리 자체로 바꿨다.
const MIN_LOOP_DISTANCE_KM = 1.2;

export function decideRouteShape(targetDistanceKm: number): RouteShapeDecision {
  if (targetDistanceKm > 0 && targetDistanceKm < MIN_LOOP_DISTANCE_KM) {
    return { kind: "out-and-back" };
  }
  return { kind: "loop" };
}

// "내 위치 사용" 버튼의 결과를 데모 홈 위치와 합성한다. 브라우저 Geolocation API
// 콜백을 이 형태로 변환해 넘기면, 실제 geolocation 없이도 성공/거부 분기를 테스트할 수 있다.
export type GeolocationOutcome = { status: "success"; coords: LatLng } | { status: "error" };

export function resolveStartLocation(outcome: GeolocationOutcome, home: LatLng): LatLng {
  return outcome.status === "success" ? outcome.coords : home;
}
