# 01 — 데모 프로필과 러닝 기록 확인

## Outcome

사용자가 10명의 데모 프로필 중 하나를 선택하면 그 프로필의 화면으로 전환되고, GPX 활동 파일을 업로드하면 별도 설정 없이 즉시 거리·소요시간·평균 페이스·케이던스·심박수와 개인 기록(PR) 경신 여부가 보인다.

## Blockers

None.

## Acceptance criteria

- [x] 화면 진입 시 10명의 데모 프로필 목록이 보이고, 하나를 선택하면 그 프로필의 데이터로 전체 화면이 갱신된다.
- [x] 유효한 GPX 파일을 업로드하면 파싱되어 그 활동이 기록 목록에 즉시 반영된다.
- [x] 업로드한 파일이 유효한 GPX가 아니면 오류 메시지가 보이고, 기존 기록은 변하지 않는다.
- [x] 각 활동에 거리·소요시간·평균 페이스·케이던스·심박수가 표시되며, 케이던스/심박 확장 필드가 없는 GPX는 해당 항목만 표시하지 않고 나머지는 정상 표시된다.
- [x] 어떤 활동이 그 프로필의 최장 거리 또는 최고 평균 페이스를 경신하면 기록 확인 화면에 "신기록" 표시가 보인다.

## Constraints

- GPX 파싱과 기록 목록·PR 판정은 `data/seed/activities/<profileId>/*.gpx`(정상 픽스처)와 `data/seed/invalid-samples/broken.gpx`(오류 픽스처)로 검증한다. 시드 데이터가 없으면 `bun run seed:generate`로 재생성한다.
- 개인 기록(PR) 카테고리는 최장 거리와 최고 평균 페이스 두 가지로 시작한다(스펙의 가정).

## Verification

- `lib/gpx.test.ts`: 자체 제작한 소형 GPX 픽스처로 거리·시간·페이스·케이던스·심박 계산, 확장 필드 없는 경우, 잘못된 좌표·비-GPX·포인트 부족을 각각 검증하는 단위 테스트(데이터 생성 여부와 무관하게 항상 실행 가능하도록 시드 파일 대신 인라인 픽스처 사용).
- `lib/records.test.ts`: PR 판정 로직에 대한 단위 테스트(첫 활동은 양쪽 PR, 더 길지만 느린 활동, 입력 순서가 뒤섞인 경우, 기록을 세우지 못하는 경우).
- `app/page.test.tsx`: 프로필 전환·업로드 성공/실패 시 화면 반영을 모킹된 fetch로 검증하는 컴포넌트 테스트.
- 런타임 검증: `bun run dev`로 실제 화면을 열어 프로필 전환과 시드 활동 표시, PR 배지, 확장 필드 없는 항목의 "—" 표시를 확인. `/api/activities/parse`에 `data/seed/invalid-samples/broken.gpx`의 실제 내용을 그대로 보내 400과 오류 메시지를 확인.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `bun run test`(15 tests, lib/gpx.test.ts·lib/records.test.ts·app/page.test.tsx 포함) 통과, `bun run typecheck`·`bun run lint` 통과. `bun run dev`로 실행한 실제 화면에서 프로필 전환(정하은→김도윤) 시 홈 위치·기록이 전부 갱신됨을 확인. `/api/activities/parse`에 유효한 GPX와 `data/seed/invalid-samples/broken.gpx`의 실제 내용을 각각 보내 200/400 응답과 오류 메시지를 확인. 케이던스·심박 확장 필드가 없는 시드 활동은 "케이던스 —"·"심박수 —"로, PR을 세운 활동은 "신기록: 최장 거리"/"신기록: 최고 페이스"로 실제 화면에 표시됨을 확인.
- Blocker: —
- Revision: —
- Review: `code-review low` 1회, 발견 사항 없음(diff 범위: app/page.tsx, app/api/**, lib/gpx.ts, lib/records.ts, lib/seed-profiles.ts, package.json, .gitignore). `lib/gpx.ts`·`scripts/*.ts`에 중복된 하버사인 공식은 스펙 수용 기준과 무관해 `docs/follow-ups/duplicated-haversine-distance-formula.md`로 남김.
