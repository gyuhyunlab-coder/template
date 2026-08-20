# 시드 GPX 파싱 실패가 조용히 무시됨

`lib/seed-profiles.ts`의 `listSeedActivities`에서 `parseGpx` 실패 시 로그 없이 `continue`하므로, 시드 `.gpx` 파일이 손상되면 해당 활동이 아무 경고 없이 기록·리더보드 집계에서 통째로 빠진다.
