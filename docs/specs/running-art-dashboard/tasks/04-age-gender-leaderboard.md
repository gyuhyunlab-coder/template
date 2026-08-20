# 04 — 연령대·성별 그룹 리더보드

## Outcome

선택된 프로필과 같은 10살 단위 연령대 + 같은 성별인 프로필들 사이에서, 총 거리·평균 페이스·러닝 횟수 등 여러 지표를 전환해가며 주간/월간 순위를 확인할 수 있다.

## Blockers

01 (데모 프로필과 러닝 기록 확인) — 순위 집계에 여러 프로필의 파싱된 활동 데이터가 필요하다.

## Acceptance criteria

- [x] 리더보드는 선택된 프로필과 같은 10살 단위 연령대 + 같은 성별인 프로필들 사이에서만 순위를 매긴다.
- [x] 지표(총 거리/평균 페이스/러닝 횟수)를 전환하면 순위 목록이 그 지표 기준으로 다시 정렬된다.
- [x] 주간/월간 기간을 전환하면 그 기간에 맞는 순위로 갱신된다.

## Constraints

- 연령대 그룹핑은 `Math.floor(age / 10) * 10`(10살 단위)과 성별 조합으로 만든다.
- 주간 리더보드는 월요일 시작 기준, 월간 리더보드는 달력월 기준으로 집계한다(스펙의 가정).
- 리더보드 기본 지표는 총 거리, 평균 페이스, 러닝 횟수 세 가지로 시작한다(스펙의 가정).
- 시드 데이터의 연령대+성별 그룹은 20대여(3명)·30대남(3명)·40대여(2명)·50대남(2명)으로 구성되어 있어, 이 조합으로 실제 경쟁(2명 이상)이 있는 그룹과 없는 그룹을 모두 확인할 수 있다.

## Verification

- 10명 시드 프로필을 연령대+성별로 정확히 분류하는 단위 테스트.
- 각 지표(총 거리/평균 페이스/러닝 횟수)로 정렬했을 때 순서가 올바른 단위 테스트.
- 주간(월요일 시작)·월간(달력월) 경계에 걸친 활동이 올바른 기간에 집계되는 단위 테스트.

## Review checkpoint

None.

## Status

superseded

## Execution

- Verification: `bun run test`(48 tests, 새로 추가한 `lib/leaderboard.test.ts`의 그룹핑·지표별 정렬·주간(월요일 시작)/월간(달력월) 경계 테스트 포함) 통과, `bun run typecheck`·`bun run lint`(내가 만든 파일 기준 오류 없음) 통과. `bun run dev`로 이미 떠 있던 서버(포트 8601)에서 실제 화면을 열어 확인: `jung-haeun`(정하은)으로 리더보드 탭을 열면 같은 `20대 여성` 그룹인 박서연·최유진과 함께 3명이 순위에 뜨고(총 거리 기준 1위 박서연 19.9km · 2위 최유진 9.9km · 3위 정하은(나) 5.4km), `park-seoyeon`(박서연)으로 전환해도 같은 3명 그룹에서 본인이 1위로 하이라이트됨을 확인. 지표를 "평균 페이스"로 전환하면 순서가 박서연·정하은·최유진으로 바뀌고, 기간을 "월간"으로 전환하면 같은 순서를 유지한 채 평균 페이스 수치가 갱신됨을 확인. `/api/leaderboard`를 curl로 직접 호출해 20대 여성(3명)·30대 남성(3명)·40대 여성(2명)·50대 남성(2명) 네 그룹 모두 올바르게 클러스터링됨을 별도 확인.
- Blocker: —
- Revision: 사용자가 이름 있는 순위표 대신 "나 vs 비슷한 러너 평균" 레이더 차트로 바꿔 달라고 직접 요청함(다른 사람 이름이 보이지 않는 개인 앱으로 재설계). `components/dashboard/leaderboard-view.tsx`·`lib/leaderboard.ts`·`lib/leaderboard.test.ts`·`app/api/leaderboard/route.ts`를 삭제하고, 05-personal-level-radar 태스크로 대체했다.
- Review: `code-review low` 1회. 새로 만든 `lib/leaderboard.ts`·`app/api/leaderboard/route.ts`·`components/dashboard/leaderboard-view.tsx`에는 지적 사항 없음(리뷰는 diff 전체를 대상으로 돌았고, 소유 범위 밖 파일에서 발견된 4건 중 3건은 `docs/follow-ups/seed-gpx-parse-failure-silently-skipped.md`·`docs/follow-ups/seed-activity-missing-time-sorts-wrong.md`·`docs/follow-ups/upload-fetch-error-not-caught.md`로 새로 남기고, 나머지 1건(하버사인 공식 중복)은 이미 `docs/follow-ups/duplicated-haversine-distance-formula.md`로 기록되어 있어 중복 생성하지 않음). 이 파일들은 모두 이 태스크의 소유 범위(`lib/leaderboard.ts`, `app/api/leaderboard/route.ts`, `components/dashboard/leaderboard-view.tsx`) 밖이라 수정하지 않았다.
