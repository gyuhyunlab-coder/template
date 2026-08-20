"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import type { ActivityEntry, DemoProfile } from "@/lib/activity-types";
import { formatDuration } from "@/lib/format";
import { generateLoopPath, generateOutAndBackPath } from "@/lib/loop-route";
import {
  computeExpectedDurationSec,
  computeTargetDistanceKm,
  decideRouteShape,
  resolveStartLocation,
  type GeolocationOutcome,
  type LatLng,
  type RouteShapeDecision,
} from "@/lib/route-recommendation";

const KAKAO_MAP_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
const SCRIPT_ID = "kakao-maps-js-sdk";

// kakao.maps 타입 전체(@types/kakao.maps.d.ts 등)를 새 의존성으로 끌어오지 않기로
// 했다(task 03 제약: 지도 SDK용 새 npm 의존성 금지). 이 화면이 실제로 쓰는 부분만
// 최소한으로 선언해 둔다. Kakao Maps는 Google과 달리 {lat,lng} 리터럴을 바로
// 받지 않고, 반드시 kakao.maps.LatLng 인스턴스로 감싸야 한다.
interface KakaoMapsNamespace {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => { setCenter(latlng: unknown): void };
  Marker: new (opts: Record<string, unknown>) => { setPosition(latlng: unknown): void; setMap(map: unknown | null): void };
  Polyline: new (opts: Record<string, unknown>) => { setMap(map: unknown | null): void };
  LatLng: new (lat: number, lng: number) => unknown;
  // <script>가 실행된 것과 지도 클래스(LatLng/Map/...)가 실제로 쓸 수 있는 것은
  // 별개다. autoload=false로 불러온 뒤 이 load() 콜백이 실행돼야 LatLng 등의
  // 생성자가 채워진다 — 그 전에 new maps.LatLng(...)를 호출하면 "not a
  // constructor" 에러가 난다. 이미 로드가 끝난 뒤에 다시 불러도 콜백을 즉시
  // 실행해주므로 매번 이 게이트를 통해서만 "ready"로 전환한다.
  load: (callback: () => void) => void;
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsNamespace };
  }
}

type KakaoMap = InstanceType<KakaoMapsNamespace["Map"]>;
type KakaoMarker = InstanceType<KakaoMapsNamespace["Marker"]>;
type KakaoPolyline = InstanceType<KakaoMapsNamespace["Polyline"]>;

type RouteResult = { shape: RouteShapeDecision; path: LatLng[] };

export function RouteRecommendationView({
  profile,
  activities,
}: {
  profile: DemoProfile;
  activities: ActivityEntry[];
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const polylineRef = useRef<KakaoPolyline | null>(null);

  // 항상 "idle"에서 시작해 아래 effect의 kakao.maps.load() 게이트를 거쳐서만
  // "ready"가 된다 — 다른 프로필에서 이미 스크립트를 불러온 뒤 다시 전환한
  // 경우에도 load()는 즉시 콜백을 실행해주므로 다시 기다릴 필요는 없다.
  const [scriptState, setScriptState] = useState<"idle" | "ready" | "error">("idle");
  // 이 컴포넌트가 속한 ProfileDashboard가 프로필별로 key를 달리 갖고 있어(app/page.tsx)
  // 프로필을 바꾸면 이 컴포넌트 자체가 새로 마운트된다. 그래서 초기값을 그 시점의
  // profile.home으로 잡아두는 것만으로 프로필 전환 시 리셋이 자연히 이뤄진다.
  const [startLocation, setStartLocation] = useState<LatLng>({
    lat: profile.home.lat,
    lng: profile.home.lng,
  });
  const [usingMyLocation, setUsingMyLocation] = useState(false);

  const targetDistanceKm = computeTargetDistanceKm(activities);
  const expectedDurationSec = computeExpectedDurationSec(activities);

  // 목표 거리/출발 위치로부터 매번 다시 계산되는 순수 값이라 state가 아니라
  // useMemo로 둔다 — effect 안에서 이 값을 setState하면 불필요한 리렌더가 겹친다.
  // 경로 자체는 특정 벤더의 길찾기 API가 아니라 우리가 직접 생성한 도형이다
  // (task 03 리비전: 지도 표시 벤더를 몇 번 바꿔도 이 로직은 그대로 재사용된다).
  const routeResult = useMemo<RouteResult | null>(() => {
    if (targetDistanceKm <= 0) return null;
    const shape = decideRouteShape(targetDistanceKm);
    // 위도 소수부를 씨앗 삼아 프로필/위치마다 다른 루프 모양이 나오게 한다
    // (완전히 결정론적이라 렌더마다 모양이 흔들리지 않는다).
    const phaseRad = (Math.abs(startLocation.lat) * 1000) % (Math.PI * 2);
    const path =
      shape.kind === "loop"
        ? generateLoopPath(startLocation, targetDistanceKm, { phaseRad })
        : generateOutAndBackPath(startLocation, targetDistanceKm);
    return { shape, path };
  }, [startLocation, targetDistanceKm]);

  // Kakao Maps JS SDK를 <script> 태그로 직접 로드한다(공식 문서 방식, 새 npm
  // 의존성 없음). autoload=false로 불러오고, 지도 클래스가 실제로 채워지는
  // kakao.maps.load() 콜백 안에서만 "ready"로 전환한다. setState는 오직
  // load/error 콜백(비동기 이벤트) 안에서만 호출한다.
  useEffect(() => {
    if (!KAKAO_MAP_APP_KEY || scriptState === "ready") return;

    const markReady = () => setScriptState("ready");

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      if (window.kakao?.maps) {
        window.kakao.maps.load(markReady);
      } else {
        existing.addEventListener("load", () => window.kakao?.maps?.load(markReady));
        existing.addEventListener("error", () => setScriptState("error"));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao?.maps?.load(markReady);
    script.onerror = () => setScriptState("error");
    document.head.appendChild(script);
  }, [scriptState]);

  // 지도는 스크립트가 준비된 시점에 한 번만 만든다. 위치가 바뀔 때마다 지도를
  // 통째로 새로 만들면 매번 다시 그려지므로, 이후로는 setCenter/setPosition으로만
  // 갱신한다.
  useEffect(() => {
    if (scriptState !== "ready" || !mapDivRef.current || !window.kakao?.maps || mapRef.current) {
      return;
    }
    const maps = window.kakao.maps;
    const center = new maps.LatLng(startLocation.lat, startLocation.lng);
    mapRef.current = new maps.Map(mapDivRef.current, { center, level: 4 });
    markerRef.current = new maps.Marker({ position: center, map: mapRef.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 지도는 최초 1회만 생성한다
  }, [scriptState]);

  // 출발 위치나 추천 경로가 바뀌면, 이미 만들어진 지도를 그대로 이동시키고
  // 경로만 다시 그린다.
  useEffect(() => {
    const maps = window.kakao?.maps;
    const map = mapRef.current;
    if (!maps || !map) return;

    const center = new maps.LatLng(startLocation.lat, startLocation.lng);
    map.setCenter(center);
    markerRef.current?.setPosition(center);

    polylineRef.current?.setMap(null);
    polylineRef.current = null;
    if (!routeResult) return;

    polylineRef.current = new maps.Polyline({
      map,
      path: routeResult.path.map((p) => new maps.LatLng(p.lat, p.lng)),
      strokeColor: routeResult.shape.kind === "loop" ? "#d97706" : "#6b7280",
      strokeWeight: 4,
      strokeOpacity: routeResult.shape.kind === "loop" ? 1 : 0.85,
      strokeStyle: routeResult.shape.kind === "loop" ? "solid" : "shortdash",
    });
  }, [startLocation, routeResult]);

  useEffect(() => {
    return () => {
      polylineRef.current?.setMap(null);
      markerRef.current?.setMap(null);
    };
  }, []);

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      const outcome: GeolocationOutcome = { status: "error" };
      setStartLocation(resolveStartLocation(outcome, profile.home));
      setUsingMyLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const outcome: GeolocationOutcome = {
          status: "success",
          coords: { lat: position.coords.latitude, lng: position.coords.longitude },
        };
        setStartLocation(resolveStartLocation(outcome, profile.home));
        setUsingMyLocation(true);
      },
      () => {
        // 권한 거부/오류 시 조용히 데모 고정 홈 위치를 유지한다(정상적인 대체 경로).
        const outcome: GeolocationOutcome = { status: "error" };
        setStartLocation(resolveStartLocation(outcome, profile.home));
        setUsingMyLocation(false);
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">목표 거리</p>
            <p className="text-2xl font-semibold text-foreground">
              {targetDistanceKm > 0 ? `${targetDistanceKm.toFixed(2)}km` : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              최근 {Math.min(activities.length, 5)}회 활동 평균 거리 기준
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">예상 소요시간</p>
            <p className="text-2xl font-semibold text-foreground">
              {expectedDurationSec != null ? formatDuration(expectedDurationSec) : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="flex items-center gap-1.5 self-start rounded-full bg-accent-run px-3.5 py-2 text-sm font-medium text-accent-run-foreground transition-opacity hover:opacity-90"
          >
            <LocateFixed className="h-4 w-4" />
            내 위치 사용
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          출발 위치: {usingMyLocation ? "내 위치" : profile.home.label} (
          {startLocation.lat.toFixed(4)}, {startLocation.lng.toFixed(4)})
        </p>
      </div>

      {!KAKAO_MAP_APP_KEY ? (
        <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Kakao 지도 API 키가 설정되지 않았습니다
          </p>
          <p className="text-xs text-muted-foreground">
            .env에 NEXT_PUBLIC_KAKAO_MAP_APP_KEY를 설정하세요 — 설정하면 이 자리에 지도와
            추천 경로가 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {routeResult && (
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  routeResult.shape.kind === "loop"
                    ? "bg-accent-run/15 text-accent-run"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {routeResult.shape.kind === "loop" ? "루프 코스" : "왕복 코스 (반환점에서 되돌아옵니다)"}
              </span>
            )}
            {scriptState === "idle" && (
              <span className="text-xs text-muted-foreground">지도를 불러오는 중…</span>
            )}
          </div>
          {scriptState === "error" && (
            <p role="alert" className="text-sm text-destructive">
              Kakao 지도 스크립트를 불러오지 못했습니다. API 키와 네트워크 상태를 확인해 주세요.
            </p>
          )}
          <div
            ref={mapDivRef}
            aria-label="추천 경로 지도"
            className="h-[24rem] w-full rounded-2xl border border-border bg-card"
          />
        </div>
      )}
    </div>
  );
}
