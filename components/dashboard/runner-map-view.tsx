"use client";

import { useState } from "react";
import { ExternalLink, Compass, Navigation, RefreshCw } from "lucide-react";

export function RunnerMapView() {
  const [iframeKey, setIframeKey] = useState(0);

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 러너맵 소개 헤더 카드 */}
      <div className="relative overflow-hidden rounded-2xl border border-accent-run/30 bg-gradient-to-r from-card via-card to-accent-run/10 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-run text-zinc-950 shadow-sm shadow-accent-run/20 mt-0.5">
              <Compass className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-base font-bold text-foreground sm:text-lg">
                  러너맵 (RunnerMap) — 내 주변 러닝 코스
                </h3>
                <span className="rounded-full bg-accent-run/20 px-2 py-0.5 text-[10px] font-semibold text-accent-run">
                  추천 코스
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed break-keep">
                전국 러너들이 검증한 최적의 러닝 코스와 주변 편의시설(음수대·화장실)을 확인하세요.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-1 md:pt-0">
            <button
              type="button"
              onClick={reloadIframe}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              title="웹 뷰 새로고침"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>새로고침</span>
            </button>
            <a
              href="https://runnermap.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-accent-run px-3.5 py-2 text-xs font-bold text-accent-run-foreground shadow-sm shadow-accent-run/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>러너맵 바로가기</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 러너맵 임베드 웹 뷰 */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground truncate">
            <Navigation className="h-3.5 w-3.5 shrink-0 text-accent-run" />
            <span className="truncate">웹 프리뷰: https://runnermap.vercel.app</span>
          </div>
          <a
            href="https://runnermap.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-accent-run hover:underline ml-2"
          >
            <span>전체 화면</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="relative h-[680px] w-full bg-zinc-950">
          <iframe
            key={iframeKey}
            src="https://runnermap.vercel.app/"
            title="러너맵 — 내 주변 러닝 코스"
            className="h-full w-full border-0"
            allow="geolocation"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
