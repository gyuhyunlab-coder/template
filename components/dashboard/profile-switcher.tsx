"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { avatarColorClass } from "@/lib/avatar-color";
import type { DemoProfile } from "@/lib/activity-types";

// 이 앱은 "나"의 개인 대시보드로 보여야 하므로, 여러 사람의 이름을 나란히 늘어놓는
// 대신 지금 보고 있는 한 사람만 정체성으로 드러내고, 데모용 전환은 접어 둔 메뉴
// 안에 숨겨 둔다.
export function ProfileSwitcher({
  profiles,
  selectedId,
  onSelect,
}: {
  profiles: DemoProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = profiles.find((p) => p.id === selectedId) ?? null;
  if (!selected) return null;

  return (
    <div className="relative flex items-center gap-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColorClass(
          selected.id
        )}`}
      >
        {selected.name.slice(0, 1)}
      </span>
      <div className="leading-tight">
        <p className="font-medium text-foreground">{selected.name}님</p>
        <p className="text-xs text-muted-foreground">
          {selected.ageBand} {selected.gender === "F" ? "여" : "남"} · {selected.home.label}
        </p>
      </div>

      <button
        type="button"
        aria-label="다른 데모 프로필로 전환"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-64 rounded-2xl border border-border bg-card p-1.5 shadow-lg">
          <p className="px-2.5 py-1.5 text-xs text-muted-foreground">데모 프로필 전환</p>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => {
                onSelect(profile.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-sm transition-colors ${
                profile.id === selectedId
                  ? "bg-accent-run/10 text-accent-run"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColorClass(
                  profile.id
                )}`}
              >
                {profile.name.slice(0, 1)}
              </span>
              {profile.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
