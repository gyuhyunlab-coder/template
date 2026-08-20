// Shared, dependency-free geo math used across GPX parsing, the synthetic
// seed-data generator, and the live route-recommendation feature. Kept in one
// place so the same haversine/offset formulas aren't reimplemented per file.

export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6371000;
const METERS_PER_DEG_LAT = 111320;

export function haversineM(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Flat-earth offset in meters — accurate enough for short (a few km) routes;
// not meant for long-distance navigation.
export function offsetLatLng(origin: LatLng, northM: number, eastM: number): LatLng {
  const dLat = northM / METERS_PER_DEG_LAT;
  const dLng = eastM / (METERS_PER_DEG_LAT * Math.cos((origin.lat * Math.PI) / 180));
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}

// Spherical destination formula: the point distanceMeters away from origin
// along bearingDeg (0 = north, 90 = east). Used to place waypoints/turnarounds
// for generated loop and out-and-back routes.
export function destinationPoint(origin: LatLng, distanceMeters: number, bearingDeg: number): LatLng {
  const angularDistance = distanceMeters / EARTH_RADIUS_M;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lng1 = (origin.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}
