"use client";

import type { LucideIcon } from "lucide-react";
import { Gauge, History, MapPin, Route, ExternalLink } from "lucide-react";

export type DashboardTab = "records" | "route" | "level" | "recommended";

interface TabItem {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const TABS: TabItem[] = [
  { id: "records", label: "기록", icon: History },
  { id: "route", label: "내 경로", icon: Route },
  { id: "level", label: "내 수준", icon: Gauge },
  { id: "recommended", label: "추천 경로", icon: MapPin, badge: "러너맵" },
];

export function TabNav({
  active,
  onChange,
}: {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="대시보드 탭"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? "border-accent-run text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="rounded-full bg-accent-run/20 px-2 py-0.5 text-[10px] font-bold text-accent-run">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
