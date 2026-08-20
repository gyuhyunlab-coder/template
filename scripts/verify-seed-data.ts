import fs from "node:fs";
import path from "node:path";
import { haversineM } from "@/lib/geo";

const root = path.join("data", "seed", "activities");
const profileDirs = fs.readdirSync(root);
let totalFiles = 0;
let minKm = Infinity;
let maxKm = 0;
let maxLoopGapM = 0;
let noExtCount = 0;

for (const profile of profileDirs) {
  const dir = path.join(root, profile);
  const files = fs.readdirSync(dir);
  const allLat: number[] = [];
  const allLng: number[] = [];

  for (const file of files) {
    totalFiles++;
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    const coords: { lat: number; lng: number }[] = [];
    const re = /<trkpt lat="([-\d.]+)" lon="([-\d.]+)">/g;
    let m;
    while ((m = re.exec(content))) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      coords.push({ lat, lng });
      allLat.push(lat);
      allLng.push(lng);
    }
    let distM = 0;
    for (let i = 1; i < coords.length; i++) distM += haversineM(coords[i - 1], coords[i]);
    const km = distM / 1000;
    minKm = Math.min(minKm, km);
    maxKm = Math.max(maxKm, km);
    const gap = haversineM(coords[0], coords[coords.length - 1]);
    maxLoopGapM = Math.max(maxLoopGapM, gap);
    if (!content.includes("gpxtpx:hr")) noExtCount++;
  }

  // bounding box of every overlaid route for this profile: this is what the
  // heatmap actually shows, so a near-zero box would mean it draws a bullseye
  const minLat = Math.min(...allLat);
  const maxLat = Math.max(...allLat);
  const minLng = Math.min(...allLng);
  const maxLng = Math.max(...allLng);
  const widthM = haversineM({ lat: minLat, lng: minLng }, { lat: minLat, lng: maxLng });
  const heightM = haversineM({ lat: minLat, lng: minLng }, { lat: maxLat, lng: minLng });
  console.log(
    `  ${profile}: 누적 궤적 bounding box ≈ ${(widthM / 1000).toFixed(2)}km x ${(
      heightM / 1000
    ).toFixed(2)}km (${files.length}건)`
  );
}

console.log(`총 파일 수: ${totalFiles}`);
console.log(`거리 범위: ${minKm.toFixed(2)}km ~ ${maxKm.toFixed(2)}km`);
console.log(`루프 시작-끝 최대 간격: ${maxLoopGapM.toFixed(1)}m`);
console.log(`심박/케이던스 확장 필드 없는 파일: ${noExtCount}건`);
