// Shared shape used across every dashboard view (records, heatmap, route
// recommendation, leaderboard) so each can be built independently without
// redefining the same contract.
import type { ActivityRecord, ActivityWithRecords } from "@/lib/records";
import type { GpxLatLng } from "@/lib/gpx";

export interface DemoProfile {
  id: string;
  name: string;
  gender: "M" | "F";
  age: number;
  ageBand: string;
  home: { lat: number; lng: number; label: string };
}

export interface ActivityWithPath extends ActivityRecord {
  path: GpxLatLng[];
}

// The shape every dashboard tab receives: a profile's combined seed + upload
// activities, already sorted newest-first with PR flags computed.
export type ActivityEntry = ActivityWithPath & ActivityWithRecords;
