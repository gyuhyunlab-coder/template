# GPX 업로드 fetch 실패가 uploadError로 처리되지 않음

`app/page.tsx`의 `handleUpload`가 `/api/activities/parse` 응답의 `res.ok` 여부를 확인하지 않고 바로 `res.json()`을 호출해, 네트워크/서버 오류 시 예외가 `uploadError` UI 대신 처리되지 않은 rejection으로 새어나갈 수 있다.
