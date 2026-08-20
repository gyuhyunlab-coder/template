"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gauge,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Heart,
  Timer,
  Footprints,
  Flame,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { buildLevelRadar, computeRadarStats, type RadarProfileStats, type RadarAxis } from "@/lib/level-radar";
import type { ActivityEntry, DemoProfile } from "@/lib/activity-types";

const VIEW_SIZE = 340;
const CENTER = VIEW_SIZE / 2;
const RADIUS = 115;
const RING_STEPS = [0.25, 0.5, 0.75, 1];

function axisAngle(index: number, total: number) {
  return (Math.PI * 2 * index) / total - Math.PI / 2;
}

function pointAt(index: number, total: number, scorePercent: number) {
  const angle = axisAngle(index, total);
  const r = (Math.max(0, Math.min(100, scorePercent)) / 100) * RADIUS;
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
}

function polygonPoints(scores: number[]) {
  return scores
    .map((s, i) => pointAt(i, scores.length, s))
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}

interface RunnerTypeInfo {
  title: string;
  badge: string;
  description: string;
  tags: string[];
  coachTip: string;
  strength: string;
}

function determineRunnerType(
  axes: RadarAxis[],
  myStats: RadarProfileStats,
  peerStats: RadarProfileStats
): RunnerTypeInfo {
  const getScore = (key: string) => axes.find((a) => a.key === key)?.mineScore ?? 50;
  const getLead = (key: string) => {
    const ax = axes.find((a) => a.key === key);
    return ax ? ax.mineScore - ax.peerScore : 0;
  };

  const endLead = getLead("endurance");
  const spdLead = getLead("speed");
  const conLead = getLead("consistency");
  const effLead = getLead("efficiency");

  if (getScore("endurance") >= 75 && getScore("speed") >= 75) {
    return {
      title: "올라운더 마스터 러너",
      badge: "ALL-ROUND MASTER",
      description:
        "스피드와 심폐 지구력이 고르게 완성된 최상위 밸런스형 러너입니다. 단거리 템포런부터 하프/풀 마라톤 지속주까지 모든 영역에서 그룹을 리드할 수 있는 강력한 퍼포먼스를 갖추고 있습니다.",
      tags: ["#완벽한밸런스", "#페이스메이커급", "#마라톤유망주"],
      strength: "스피드와 지구력이 모두 평균을 20% 이상 상회하며 전천후 레이스 운영이 가능합니다.",
      coachTip:
        "현재 밸런스가 매우 이상적입니다. 주 1회 15km 이상의 LSD(장거리 지속주)와 월 1~2회 젖산 역치 인터벌을 조합하면 풀코스 서브3도 도전 가능합니다.",
    };
  }

  if (spdLead >= endLead && spdLead >= conLead && spdLead > 0) {
    return {
      title: "스피드 스트라이더 (스프린터)",
      badge: "SPEED STRIDER",
      description:
        "폭발적인 가속력과 높은 케이던스로 기록을 단축하는 스피드 특화형 러너입니다. 5K~10K 단거리 레이스에서 탁월한 스피드 감각을 자랑합니다.",
      tags: ["#폭발적스피드", "#5K10K강자", "#강력한추진력"],
      strength: "동일 연령대 평균보다 훨씬 빠른 킬로미터당 페이스를 유지하는 추진력이 돋보입니다.",
      coachTip:
        "뛰어난 스피드에 지구력을 보강하면 경기력이 비약적으로 상승합니다. 평소보다 페이스를 30초 늦추고 주행 거리를 20% 늘리는 유산소 빌드업 훈련을 추천합니다.",
    };
  }

  if (endLead >= spdLead && endLead >= conLead && endLead > 0) {
    return {
      title: "엔듀런스 보이저 (장거리 빌더)",
      badge: "ENDURANCE VOYAGER",
      description:
        "한 번 달리기 시작하면 지치지 않고 먼 거리를 꾸준하게 완주해내는 장거리 지속주 특화 러너입니다. 묵직하고 흔들림 없는 심폐 지구력을 보유하고 있습니다.",
      tags: ["#지치지않는심폐", "#장거리스페셜리스트", "#하프마라톤도전"],
      strength: "1회 평균 주행 거리가 동년배 평균 대비 확연히 길어 높은 유산소 베이스를 갖추고 있습니다.",
      coachTip:
        "훌륭한 지구력 베이스 위에 100m 질주 5회(스트라이드 훈련)나 짧은 인터벌을 주 1회 가미하면 페이스를 한 단계 더 끌어올릴 수 있습니다.",
    };
  }

  if (conLead > 0) {
    return {
      title: "루틴 마스터 (성실한 스트라이더)",
      badge: "ROUTINE MASTER",
      description:
        "규칙적인 주간 러닝 루틴을 흔들림 없이 유지하는 성실파 러너입니다. 꾸준함이 누적되어 부상 없이 가장 안정적으로 성장하고 있습니다.",
      tags: ["#꾸준함의대명사", "#부상방지최적화", "#마일리지부자"],
      strength: "주간 러닝 빈도가 매우 높아 신체 적응력과 기본 체력이 탄탄하게 다져져 있습니다.",
      coachTip:
        "꾸준한 주 3~4회 러닝 습관은 최고의 자산입니다. 한 주에 하루는 거리나 페이스에 변화를 주는 변속주(Fartlek)를 도입해보세요.",
    };
  }

  return {
    title: "스마트 밸런스 러너",
    badge: "BALANCED RUNNER",
    description:
      "모든 지표가 안정적인 균형을 이루며 꾸준히 우상향하고 있는 성장형 러너입니다. 러닝 데이터가 축적될수록 잠재력이 폭발적으로 발현됩니다.",
    tags: ["#안정적인밸런스", "#지속성장형", "#탄탄한기초체력"],
    strength: "체력과 주법의 기본기가 고루 잡혀 있어 어떤 훈련 목표든 유연하게 흡수할 수 있습니다.",
    coachTip:
      "현재 기본기가 아주 좋습니다. 매주 1km씩 목표 주행 거리를 늘려가며 본인만의 시그니처 러닝 코스를 완성해보세요.",
  };
}

export function LevelView({
  profile,
  activities,
}: {
  profile: DemoProfile;
  activities: ActivityEntry[];
}) {
  const [peerAverage, setPeerAverage] = useState<RadarProfileStats | null>(null);
  const [peerCount, setPeerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/level-radar?profileId=${profile.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: { peerCount: number; peerAverage: RadarProfileStats }) => {
        if (cancelled) return;
        setPeerAverage(data.peerAverage);
        setPeerCount(data.peerCount);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load level radar:", err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  const myStats = useMemo(() => computeRadarStats(activities), [activities]);
  const axes = useMemo(
    () => (peerAverage ? buildLevelRadar(myStats, peerAverage) : []),
    [myStats, peerAverage]
  );

  const runnerType = useMemo(
    () =>
      peerAverage
        ? determineRunnerType(axes, myStats, peerAverage)
        : null,
    [axes, myStats, peerAverage]
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card/40">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-run border-t-transparent" />
          <span>러너 수준 및 비교 데이터 분석 중…</span>
        </div>
      </div>
    );
  }

  const formatPace = (minPerKm: number) => {
    if (!minPerKm || minPerKm <= 0) return "-";
    const mins = Math.floor(minPerKm);
    const secs = Math.round((minPerKm - mins) * 60);
    return `${mins}'${secs.toString().padStart(2, "0")}"/km`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. 내가 어떤 유형의 러너인지 - 러너 페르소나 카드 */}
      {runnerType && (
        <div className="relative overflow-hidden rounded-3xl border border-accent-run/30 bg-gradient-to-br from-card via-card/90 to-accent-run/10 p-6 shadow-lg">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-accent-run/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-run/20 text-accent-run">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-accent-run uppercase">
                    Runner Archetype
                  </span>
                  <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                    {profile.name}님은 <span className="text-accent-run font-extrabold">{runnerType.title}</span>입니다
                  </h3>
                </div>
              </div>
              <div className="rounded-full border border-accent-run/40 bg-accent-run/15 px-3 py-1 text-xs font-semibold text-accent-run">
                {runnerType.badge}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {runnerType.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {runnerType.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 핵심 강점 요약 */}
            <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-border bg-card/80 p-3.5 text-xs text-foreground">
              <Zap className="h-4 w-4 shrink-0 text-accent-run mt-0.5" />
              <div>
                <strong className="text-foreground">핵심 강점 분석: </strong>
                <span className="text-muted-foreground">{runnerType.strength}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 레이더 차트 & 지표별 수치 비교 영역 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 레이더 차트 SVG */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 lg:col-span-6">
          <div className="mb-2 flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-accent-run" />
              <h4 className="text-sm font-semibold text-foreground">5축 러닝 퍼포먼스 레이더</h4>
            </div>
            <span className="text-[11px] text-muted-foreground">
              동일 연령대({profile.ageBand}) {peerCount}명 비교
            </span>
          </div>

          <svg
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            role="img"
            aria-label="내 수준 레이더 차트"
            className="w-full max-w-[20rem] my-2"
          >
            <g stroke="var(--color-border)" fill="none">
              {RING_STEPS.map((step) => (
                <polygon
                  key={step}
                  points={polygonPoints(axes.map(() => step * 100))}
                  strokeOpacity={0.6}
                />
              ))}
              {axes.map((_, i) => {
                const p = pointAt(i, axes.length, 100);
                return (
                  <line
                    key={i}
                    x1={CENTER}
                    y1={CENTER}
                    x2={p.x}
                    y2={p.y}
                    strokeOpacity={0.35}
                  />
                );
              })}
            </g>

            {axes.length > 0 && (
              <>
                {/* 평균 러너 폴리곤 */}
                <polygon
                  points={polygonPoints(axes.map((a) => a.peerScore))}
                  fill="var(--color-muted-foreground)"
                  fillOpacity={0.15}
                  stroke="var(--color-muted-foreground)"
                  strokeOpacity={0.6}
                  strokeWidth={1.5}
                />
                {/* 나의 점수 폴리곤 */}
                <polygon
                  points={polygonPoints(axes.map((a) => a.mineScore))}
                  fill="var(--color-accent-run)"
                  fillOpacity={0.3}
                  stroke="var(--color-accent-run)"
                  strokeWidth={2.5}
                />
              </>
            )}

            {axes.map((axis, i) => {
              const labelPoint = pointAt(i, axes.length, 126);
              const isAhead = axis.mineScore >= axis.peerScore;
              return (
                <text
                  key={axis.key}
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[11px] font-semibold ${
                    isAhead ? "fill-accent-run" : "fill-foreground"
                  }`}
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>

          {/* 범례 */}
          <div className="mt-2 flex items-center justify-center gap-6 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <span className="h-3 w-3 rounded-full bg-accent-run shadow-sm shadow-accent-run/50" />
              <span>{profile.name}님</span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-3 w-3 rounded-full border border-muted-foreground bg-muted-foreground/30" />
              <span>동년배 평균</span>
            </span>
          </div>
        </div>

        {/* 5개 지표 상세 수치 비교 카드 */}
        <div className="flex flex-col justify-between gap-3 rounded-3xl border border-border bg-card p-6 lg:col-span-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground">지표별 상세 수치 비교</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              동일 연령대 러너들의 평균 데이터와 실제 기록을 1:1로 대조합니다.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* 1. 지구력 / 평균 거리 */}
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2.5">
                <Footprints className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-foreground">평균 1회 러닝 거리</div>
                  <div className="text-[11px] text-muted-foreground">
                    평균: {peerAverage?.avgDistanceKm.toFixed(2)}km
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">
                  {myStats.avgDistanceKm.toFixed(2)}km
                </div>
                <div
                  className={`text-[11px] font-semibold ${
                    myStats.avgDistanceKm >= (peerAverage?.avgDistanceKm ?? 0)
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {myStats.avgDistanceKm >= (peerAverage?.avgDistanceKm ?? 0) ? "▲ " : "▼ "}
                  {Math.abs(
                    ((myStats.avgDistanceKm - (peerAverage?.avgDistanceKm ?? 1)) /
                      (peerAverage?.avgDistanceKm || 1)) *
                      100
                  ).toFixed(0)}
                  %
                </div>
              </div>
            </div>

            {/* 2. 스피드 / 평균 페이스 */}
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2.5">
                <Timer className="h-4 w-4 text-sky-400" />
                <div>
                  <div className="text-xs font-semibold text-foreground">평균 페이스</div>
                  <div className="text-[11px] text-muted-foreground">
                    평균: {formatPace(peerAverage?.avgPaceMinPerKm ?? 0)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">
                  {formatPace(myStats.avgPaceMinPerKm)}
                </div>
                <div
                  className={`text-[11px] font-semibold ${
                    myStats.avgPaceMinPerKm <= (peerAverage?.avgPaceMinPerKm ?? 99)
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {myStats.avgPaceMinPerKm <= (peerAverage?.avgPaceMinPerKm ?? 99)
                    ? "▲ 상위 페이스"
                    : "▼ 페이스 보완"}
                </div>
              </div>
            </div>

            {/* 3. 꾸준함 / 주간 빈도 */}
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2.5">
                <Flame className="h-4 w-4 text-orange-400" />
                <div>
                  <div className="text-xs font-semibold text-foreground">주간 러닝 빈도</div>
                  <div className="text-[11px] text-muted-foreground">
                    평균: 주 {peerAverage?.runsPerWeek.toFixed(1)}회
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">
                  주 {myStats.runsPerWeek.toFixed(1)}회
                </div>
                <div
                  className={`text-[11px] font-semibold ${
                    myStats.runsPerWeek >= (peerAverage?.runsPerWeek ?? 0)
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {myStats.runsPerWeek >= (peerAverage?.runsPerWeek ?? 0) ? "▲ 우수" : "▼ 보통"}
                </div>
              </div>
            </div>

            {/* 4. 회복 및 심박 / 케이던스 */}
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center gap-2.5">
                <Heart className="h-4 w-4 text-rose-400" />
                <div>
                  <div className="text-xs font-semibold text-foreground">평균 심박수 & 케이던스</div>
                  <div className="text-[11px] text-muted-foreground">
                    {myStats.avgCadenceSpm ? `${Math.round(myStats.avgCadenceSpm)} spm` : "-"} /{" "}
                    {myStats.avgHrBpm ? `${Math.round(myStats.avgHrBpm)} bpm` : "-"}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs font-medium text-muted-foreground">
                안정적 유산소 존
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI 러닝 코치 맞춤 트레이닝 어드바이스 */}
      {runnerType && (
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent-run" />
            <h4 className="text-base font-bold text-foreground">
              AI 러닝 코치의 다음 단계 트레이닝 가이드
            </h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {runnerType.coachTip}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-muted/20 p-3.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-run mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-foreground">주 1회 인터벌 세션</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  젖산 역치를 높여 최고 페이스를 갱신합니다.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-muted/20 p-3.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-run mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-foreground">주말 LSD (장거리 지속주)</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  심폐 베이스를 확장하고 하프 완주 체력을 만듭니다.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-muted/20 p-3.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-run mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-foreground">회복 조깅 & 스트레칭</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  근육 피로를 풀고 부상 없는 롱런을 보장합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
