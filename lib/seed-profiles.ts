import fs from "node:fs";
import path from "node:path";
import { parseGpx, type GpxLatLng } from "@/lib/gpx";
import staticProfiles from "@/data/seed/profiles.json";

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

const SEED_DIR = path.join(process.cwd(), "data", "seed");

export function listDemoProfiles(): DemoProfile[] {
  try {
    const filePath = path.join(SEED_DIR, "profiles.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading profiles.json from filesystem, using static fallback:", err);
  }
  return staticProfiles as DemoProfile[];
}

export function getDemoProfile(profileId: string): DemoProfile | null {
  return listDemoProfiles().find((p) => p.id === profileId) ?? null;
}

export function listSeedActivities(profileId: string): SeedActivity[] {
  try {
    const dir = path.join(SEED_DIR, "activities", profileId);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".gpx"));
    const activities: SeedActivity[] = [];

    for (const file of files) {
      const xml = fs.readFileSync(path.join(dir, file), "utf-8");
      const result = parseGpx(xml);
      if (!result.ok) continue; // seed data is generated and expected to be valid
      const { activity } = result;
      activities.push({
        id: file.replace(/\.gpx$/, ""),
        date: activity.startTime ?? file.replace(/\.gpx$/, ""),
        distanceKm: activity.distanceKm,
        durationSec: activity.durationSec,
        avgPaceMinPerKm: activity.avgPaceMinPerKm,
        avgCadenceSpm: activity.avgCadenceSpm,
        avgHrBpm: activity.avgHrBpm,
        path: activity.path,
      });
    }

    return activities.sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.error(`Error reading seed activities for ${profileId}:`, err);
    return [];
  }
}
