// Flags personal records (PRs) across a profile's full activity history.
// Pure and isomorphic on purpose: the client merges pre-loaded demo
// activities with freshly uploaded ones before this ever runs, so a record
// depends on the combined list, not on where an activity came from.

export interface ActivityRecord {
  id: string;
  date: string; // ISO
  distanceKm: number;
  durationSec: number;
  avgPaceMinPerKm: number;
  avgCadenceSpm: number | null;
  avgHrBpm: number | null;
}

export interface ActivityWithRecords extends ActivityRecord {
  isLongestDistancePr: boolean;
  isBestPacePr: boolean;
}

export function withPersonalRecords<T extends ActivityRecord>(
  activities: T[]
): (T & ActivityWithRecords)[] {
  const chronological = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  let longestDistanceKm = -Infinity;
  let bestPaceMinPerKm = Infinity;
  const flagsById = new Map<string, { isLongestDistancePr: boolean; isBestPacePr: boolean }>();

  for (const activity of chronological) {
    const isLongestDistancePr = activity.distanceKm > longestDistanceKm;
    const isBestPacePr = activity.avgPaceMinPerKm > 0 && activity.avgPaceMinPerKm < bestPaceMinPerKm;
    if (isLongestDistancePr) longestDistanceKm = activity.distanceKm;
    if (isBestPacePr) bestPaceMinPerKm = activity.avgPaceMinPerKm;
    flagsById.set(activity.id, { isLongestDistancePr, isBestPacePr });
  }

  return activities.map((activity) => ({
    ...activity,
    ...(flagsById.get(activity.id) ?? { isLongestDistancePr: false, isBestPacePr: false }),
  }));
}
