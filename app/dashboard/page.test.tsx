import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import DashboardPage from "@/app/dashboard/page";

const PROFILES = [
  {
    id: "p1",
    name: "정하은",
    gender: "F" as const,
    age: 24,
    ageBand: "20대",
    home: { lat: 37.51, lng: 127.01, label: "반포한강공원" },
  },
  {
    id: "p2",
    name: "김도윤",
    gender: "M" as const,
    age: 39,
    ageBand: "30대",
    home: { lat: 37.54, lng: 127.03, label: "서울숲" },
  },
];

const SEED_ACTIVITIES: Record<string, unknown[]> = {
  p1: [
    {
      id: "2026-05-01",
      date: "2026-05-01T06:00:00Z",
      distanceKm: 5,
      durationSec: 1800,
      avgPaceMinPerKm: 6,
      avgCadenceSpm: 170,
      avgHrBpm: 150,
      path: [],
    },
  ],
  p2: [],
};

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url === "/api/profiles") {
      return new Response(JSON.stringify(PROFILES), { status: 200 });
    }
    const activitiesMatch = url.match(/^\/api\/profiles\/([^/]+)\/activities$/);
    if (activitiesMatch) {
      return new Response(JSON.stringify(SEED_ACTIVITIES[activitiesMatch[1]] ?? []), {
        status: 200,
      });
    }
    if (url === "/api/activities/parse") {
      const body = JSON.parse(String(init?.body ?? "{}"));
      if (body.gpxText?.includes("BROKEN")) {
        return new Response(JSON.stringify({ ok: false, error: "GPX 파일이 아닙니다." }), {
          status: 400,
        });
      }
      return new Response(
        JSON.stringify({
          ok: true,
          activity: {
            distanceKm: 12,
            durationSec: 3600,
            avgPaceMinPerKm: 5,
            avgCadenceSpm: 180,
            avgHrBpm: 160,
            startTime: "2026-06-01T06:00:00Z",
            path: [],
          },
        }),
        { status: 200 }
      );
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("데모 프로필을 선택하면 그 프로필의 기록이 보인다", async () => {
  render(<DashboardPage />);

  expect(await screen.findByText(/정하은님/)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByText("5.00km")).toBeInTheDocument();
  });
  expect(screen.getByText("신기록: 최장 거리")).toBeInTheDocument();
});

test("다른 프로필로 전환하면 화면이 그 프로필 데이터로 갱신된다", async () => {
  render(<DashboardPage />);
  await screen.findByText("5.00km");

  fireEvent.click(screen.getByRole("button", { name: "다른 데모 프로필로 전환" }));
  fireEvent.click(screen.getByRole("button", { name: /김도윤/ }));

  await waitFor(() => {
    expect(screen.getByText(/아직 업로드된 활동이 없습니다/)).toBeInTheDocument();
  });
  expect(screen.queryByText("5.00km")).not.toBeInTheDocument();
});

test("유효한 GPX를 업로드하면 즉시 기록 목록에 반영된다", async () => {
  render(<DashboardPage />);
  await screen.findByText("5.00km");

  const file = new File(["<gpx>valid</gpx>"], "run.gpx", { type: "application/gpx+xml" });
  const input = screen.getByLabelText("GPX 파일 업로드");
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText("12.00km")).toBeInTheDocument();
  });
  // 기존 기록은 그대로 남아 있다
  expect(screen.getByText("5.00km")).toBeInTheDocument();
});

test("유효하지 않은 GPX를 업로드하면 오류만 보이고 기존 기록은 그대로 남는다", async () => {
  render(<DashboardPage />);
  await screen.findByText("5.00km");

  const file = new File(["BROKEN"], "broken.gpx", { type: "application/gpx+xml" });
  const input = screen.getByLabelText("GPX 파일 업로드");
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("GPX 파일이 아닙니다.");
  });
  expect(screen.getByText("5.00km")).toBeInTheDocument();
  expect(screen.queryByText("12.00km")).not.toBeInTheDocument();
});
