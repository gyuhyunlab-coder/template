# `<time>` 태그 없는 시드 GPX의 날짜 폴백이 정렬을 흐트러뜨릴 수 있음

`lib/seed-profiles.ts`의 `listSeedActivities`가 GPX에 시작 시각이 없으면 `date`를 `YYYY-MM-DD` 파일명으로 폴백하는데, 나머지 활동은 전체 ISO 타임스탬프를 쓰므로 `app/page.tsx`의 `b.date.localeCompare(a.date)` 정렬에서 같은 날짜의 활동끼리 순서가 뒤바뀔 수 있다.
