import { listDemoProfiles } from "@/lib/seed-profiles";

export async function GET() {
  return Response.json(listDemoProfiles());
}
