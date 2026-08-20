"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { ProfileSwitcher } from "@/components/dashboard/profile-switcher";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { TabNav, type DashboardTab } from "@/components/dashboard/tab-nav";
import { RecordsView } from "@/components/dashboard/records-view";
import { RouteRecommendationView } from "@/components/dashboard/route-recommendation-view";
import { LevelView } from "@/components/dashboard/level-view";
import { RunnerMapView } from "@/components/dashboard/runner-map-view";
import { withPersonalRecords } from "@/lib/records";
import type { ActivityWithPath, DemoProfile } from "@/lib/activity-types";

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profiles")
      .then((res) => res.json())
      .then((data: DemoProfile[]) => {
        setProfiles(data);
        // /login에서 프로필을 골라 들어온 경우 그 프로필을 우선한다 —
        // useSearchParams는 정적 렌더 시 Suspense 경계가 필요해, 이미 전부
        // 클라이언트에서 fetch하는 이 페이지에서는 window.location으로 읽는
        // 편이 더 간단하다.
        const requestedId = new URLSearchParams(window.location.search).get("profile");
        setSelectedId((current) => current ?? requestedId ?? data[0]?.id ?? null);
      });
  }, []);

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b border-border bg-gradient-to-b from-accent-run/[0.07] to-transparent">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-accent-run uppercase">
                Personal Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Runno</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                매일의 러닝이 쌓여 나의 성장이 됩니다.
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </Link>
          </div>

          <ProfileSwitcher profiles={profiles} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-6">
        {selectedProfile && (
          <ProfileDashboard key={selectedProfile.id} profile={selectedProfile} />
        )}
      </main>
    </div>
  );
}

function ProfileDashboard({ profile }: { profile: DemoProfile }) {
  const [seedActivities, setSeedActivities] = useState<ActivityWithPath[]>([]);
  const [uploadedActivities, setUploadedActivities] = useState<ActivityWithPath[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DashboardTab>("records");

  useEffect(() => {
    fetch(`/api/profiles/${profile.id}/activities`)
      .then((res) => res.json())
      .then((data: ActivityWithPath[]) => {
        setSeedActivities(data);
        setLoading(false);
      });
  }, [profile.id]);

  const activitiesWithRecords = useMemo(() => {
    const combined = [...seedActivities, ...uploadedActivities];
    return withPersonalRecords(combined).sort((a, b) => b.date.localeCompare(a.date));
  }, [seedActivities, uploadedActivities]);

  async function handleUpload(file: File) {
    setUploadError(null);
    const gpxText = await file.text();
    const res = await fetch("/api/activities/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gpxText }),
    });
    const data = await res.json();
    if (!data.ok) {
      setUploadError(data.error ?? "GPX 파일을 읽을 수 없습니다.");
      return;
    }
    const activity = data.activity;
    setUploadedActivities((prev) => [
      ...prev,
      {
        id: `upload-${Date.now()}-${prev.length}`,
        date: activity.startTime ?? new Date().toISOString(),
        distanceKm: activity.distanceKm,
        durationSec: activity.durationSec,
        avgPaceMinPerKm: activity.avgPaceMinPerKm,
        avgCadenceSpm: activity.avgCadenceSpm,
        avgHrBpm: activity.avgHrBpm,
        path: activity.path,
      },
    ]);
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      <StatStrip activities={activitiesWithRecords} />
      <TabNav active={tab} onChange={setTab} />

      <div>
        {tab === "records" && (
          <RecordsView
            activities={activitiesWithRecords}
            loading={loading}
            uploadError={uploadError}
            onUpload={handleUpload}
          />
        )}
        {tab === "route" && (
          <RouteRecommendationView profile={profile} activities={activitiesWithRecords} />
        )}
        {tab === "level" && <LevelView profile={profile} activities={activitiesWithRecords} />}
        {tab === "recommended" && <RunnerMapView />}
      </div>
    </div>
  );
}
