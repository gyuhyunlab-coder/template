import { Check, Upload } from "lucide-react";
import { formatDate, formatDuration, formatPace } from "@/lib/format";
import type { ActivityEntry } from "@/lib/activity-types";

export function RecordsView({
  activities,
  loading,
  uploadError,
  onUpload,
}: {
  activities: ActivityEntry[];
  loading: boolean;
  uploadError: string | null;
  onUpload: (file: File) => void;
}) {
  const latest = activities[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-accent-run/30 bg-accent-run/5 p-4">
        {latest ? (
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-run text-accent-run-foreground">
              <Check className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">최근 활동이 업로드되었습니다</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(latest.date)} · {latest.distanceKm.toFixed(2)}km ·{" "}
                {formatDuration(latest.durationSec)} · {formatPace(latest.avgPaceMinPerKm)}
              </p>
            </div>
          </div>
        ) : (
          !loading && <p className="text-sm text-muted-foreground">아직 업로드된 활동이 없습니다.</p>
        )}

        <label
          htmlFor="gpx-upload"
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-accent-run hover:underline"
        >
          <Upload className="h-3.5 w-3.5" />
          다른 GPX 활동 업로드
        </label>
        <input
          id="gpx-upload"
          type="file"
          accept=".gpx"
          aria-label="GPX 파일 업로드"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
        {uploadError && (
          <p role="alert" className="text-sm text-destructive">
            {uploadError}
          </p>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">불러오는 중…</p>}

      <ul className="flex flex-col gap-2">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-3.5 pl-4 text-sm"
          >
            {(activity.isLongestDistancePr || activity.isBestPacePr) && (
              <span className="absolute inset-y-0 left-0 w-1 bg-accent-run" />
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium">{formatDate(activity.date)}</span>
              <span>{activity.distanceKm.toFixed(2)}km</span>
              <span>{formatDuration(activity.durationSec)}</span>
              <span>{formatPace(activity.avgPaceMinPerKm)}</span>
              <span className="text-muted-foreground">
                케이던스{" "}
                {activity.avgCadenceSpm != null ? `${Math.round(activity.avgCadenceSpm)}spm` : "—"}
              </span>
              <span className="text-muted-foreground">
                심박수 {activity.avgHrBpm != null ? `${Math.round(activity.avgHrBpm)}bpm` : "—"}
              </span>
            </div>
            {(activity.isLongestDistancePr || activity.isBestPacePr) && (
              <div className="mt-1.5 flex gap-1.5">
                {activity.isLongestDistancePr && (
                  <span className="rounded-full bg-accent-run/15 px-2 py-0.5 text-xs font-medium text-accent-run">
                    신기록: 최장 거리
                  </span>
                )}
                {activity.isBestPacePr && (
                  <span className="rounded-full bg-accent-run/15 px-2 py-0.5 text-xs font-medium text-accent-run">
                    신기록: 최고 페이스
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
