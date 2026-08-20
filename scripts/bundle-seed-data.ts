import fs from "node:fs";
import path from "node:path";
import { parseGpx } from "../lib/gpx";

const SEED_DIR = path.join(process.cwd(), "data", "seed");
const profilesRaw = fs.readFileSync(path.join(SEED_DIR, "profiles.json"), "utf-8");
const profiles = JSON.parse(profilesRaw);

const activitiesByProfile: Record<string, any[]> = {};

for (const profile of profiles) {
  const dir = path.join(SEED_DIR, "activities", profile.id);
  if (!fs.existsSync(dir)) {
    activitiesByProfile[profile.id] = [];
    continue;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".gpx"));
  const list: any[] = [];

  for (const file of files) {
    const xml = fs.readFileSync(path.join(dir, file), "utf-8");
    const result = parseGpx(xml);
    if (!result.ok) continue;
    const { activity } = result;
    list.push({
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

  list.sort((a, b) => a.date.localeCompare(b.date));
  activitiesByProfile[profile.id] = list;
}

fs.writeFileSync(
  path.join(SEED_DIR, "activities.json"),
  JSON.stringify(activitiesByProfile, null, 2),
  "utf-8"
);

console.log("Successfully generated data/seed/activities.json");
