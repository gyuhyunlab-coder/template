# 02 — 누적 경로 히트맵/아트 시각화

## Outcome

현재 선택된 프로필이 업로드한 모든 활동의 경로가 지도(또는 캔버스) 위에 반투명하게 겹쳐진 히트맵/아트로 누적되어 보인다.

## Blockers

01 (데모 프로필과 러닝 기록 확인) — 히트맵이 겹쳐 그릴 경로 트랙(좌표 목록)은 01에서 파싱된 활동 데이터로부터 나온다.

## Acceptance criteria

- [x] 히트맵 화면에는 현재 선택된 프로필이 업로드한 모든 활동의 경로가 반투명하게 겹쳐 보인다.
- [x] 다른 프로필로 전환하면 히트맵이 그 프로필의 경로로 교체되고, 이전 프로필의 경로는 섞이지 않는다.

## Constraints

- 히트맵은 프로필 본인의 누적 경로만 보여준다. 다른 프로필과 합산한 뷰는 만들지 않는다(스펙의 가정).
- `data/seed/activities/**`의 10개 프로필은 서로 다른 서울 지역에 퍼져 있고 경로 모양도 강변형(좁고 긴 형태)과 공원형(방사형으로 퍼지는 형태)으로 나뉘어 있으니, 겹쳐 그렸을 때 이 차이가 실제로 드러나는지 확인한다.

## Verification

- 시드 데이터의 서로 다른 프로필 2개 이상으로 전환하며, 렌더링에 전달되는 좌표 집합이 각 프로필의 활동 트랙과 정확히 일치하고 서로 섞이지 않는 단위/컴포넌트 테스트.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `lib/heatmap-projection.test.ts`(7개 케이스: 빈 경로, 포인트 개수·순서 보존, padding 경계 상자 준수, 0으로 나누기 방지, 위도-y축 반전, 강변형 종횡비 유지, 여러 경로의 공유 스케일)를 추가해 `bun run test` 통과(44 tests, 7 files). `bun run typecheck`·`bun run lint` 통과(기존에도 있던 `scripts/generate-seed-data.ts`의 미사용 변수 경고 7개만 남고 신규 오류 없음). `bun run dev`(포트 8601)로 실제 화면을 열어 정하은(강변형, 반포한강공원, 44건)과 김도윤(공원형, 서울숲, 33건) 두 프로필의 히트맵을 확인: 정하은은 좁고 긴 타원형 궤적이 겹겹이 겹쳐 보이고, 김도윤은 중심에서 사방으로 퍼지는 방사형(꽃 모양) 궤적으로 뚜렷이 다르게 렌더링됨을 확인. 프로필 전환 시 `key={selectedProfile.id}`로 `ProfileDashboard`가 리마운트되어 두 프로필의 경로가 섞이지 않음을 화면과 DOM에서 확인(김도윤 전환 시 polyline 66개 = 활동 33건 × 2겹만 존재). 다크 모드(`document.documentElement.classList.add('dark')`)와 모바일 뷰포트(375px)에서도 선이 선명하게 보이고 가로 스크롤이 생기지 않음을 확인. 콘솔에서 `<svg height="auto">` 속성 오류를 발견해 `width`/`height` 속성을 제거하고 `aspect-[640/420]` 클래스로 대체, DOM에서 속성이 사라졌음을 재확인.
- Blocker: —
- Revision: SVG 반응형 처리를 위해 `width="100%" height="auto"`로 시작했으나, `height="auto"`가 유효하지 않은 SVG 속성값이라 런타임 콘솔 오류가 발생함을 발견하고 `width`/`height` 속성을 모두 제거한 뒤 Tailwind `aspect-[640/420]` 유틸리티로 대체.
- Review: `code-review low` 1회 실행(`git diff HEAD` 기준 저장소 전체 변경분 대상). 이 태스크가 소유한 파일(`lib/heatmap-projection.ts`, `lib/heatmap-projection.test.ts`, `components/dashboard/heatmap-view.tsx`)에는 지적 사항 없음. 발견된 3건(`scripts/generate-seed-data.ts`의 거리 보정 후 재생성 시 다른 랜덤 시드가 적용되는 문제, `lib/gpx.ts`의 타임스탬프 누락 시 `times`/`path` 인덱스 불일치, 하버사인 공식 중복)은 모두 이 태스크의 소유 범위 밖(01 태스크·시드 스크립트) 파일이라 수정하지 않음.
- Revision(추가): 사용자가 실제 히트맵을 보고 "이상하다"고 피드백했다. 원인은 히트맵이 아니라 시드 데이터의 경로 도형 자체 — 매끈한 사인 곡선 루프라 실제 거리처럼 보이지 않았다. `scripts/generate-seed-data.ts`의 `buildLoop`이 `lib/loop-route.ts`의 직사각형 블록 루프 생성 로직을 재사용하도록 바꾸고, 모든 프로필에 고정 `bearingDeg`를 부여해 같은 프로필의 여러 런이 같은 방향의 변을 공유하도록 했다(자세한 배경은 03 태스크의 Revision 참고). 시드 재생성 후 강변형 프로필의 누적 궤적이 겹치는 띠 모양으로, 공원형 프로필은 겹치는 사각 블록 다발로 렌더링됨을 브라우저에서 확인했다.
