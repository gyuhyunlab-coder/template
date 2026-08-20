import { SEED_PROFILES, SEED_ACTIVITIES } from "@/lib/seed-data";
import type { GpxLatLng } from "@/lib/gpx";

export interface DemoProfile {
  id: string;
  name: string;
  gender: "M" | "F";
  age: number;
  ageBand: string;
  home: { lat: number; lng: number; label: string };
}

export interface SeedActivity {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  avgPaceMinPerKm: number;
  avgCadenceSpm: number | null;
  avgHrBpm: number | null;
  path: GpxLatLng[];
}

export function listDemoProfiles(): DemoProfile[] {
  return SEED_PROFILES as unknown as DemoProfile[];
}

export function getDemoProfile(profileId: string): DemoProfile | null {
  return listDemoProfiles().find((p) => p.id === profileId) ?? null;
}

export function listSeedActivities(profileId: string): SeedActivity[] {
  return (SEED_ACTIVITIES[profileId] ?? []) as SeedActivity[];
}
