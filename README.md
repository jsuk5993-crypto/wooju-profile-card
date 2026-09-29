# WOOJU Profile Card v18 - PNG export fix

AI 생성/카드 디자인은 v17 그대로 유지하고 PNG 저장만 수정했습니다.

수정 내용:
- 라이브 카드의 transform을 해제하지 않음 (저장 시 화면 확대/잘림 제거)
- html2canvas가 복제한 카드만 1080x1080 원본 크기로 렌더
- 저장 전에 폰트/이미지 로딩 대기
- Riot 외부 이미지 CORS 모드 설정
- html2canvas 1.4.1과 충돌할 수 있는 color-mix() 제거
- 오류가 나도 미리보기 크기가 반드시 정상 유지
- 대용량 AI base64 이미지를 localStorage에 저장하지 않아 QuotaExceeded 오류 방지

GitHub에서 루트의 app.js와 styles.css 두 파일만 교체하면 됩니다. Render/server 파일은 수정하지 않습니다.
