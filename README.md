# WOOJU Profile Card v19

PNG 저장 방식을 `html2canvas`에서 `html-to-image`로 교체했습니다.

## 이유
기존 html2canvas가 카드의 `clip-path`와 복잡한 프레임 CSS를 정확히 렌더링하지 못해
저장 PNG에 보라색 반투명 면과 네모난 코너가 생겼습니다.

## 교체할 파일
GitHub 루트에서 아래 두 파일만 교체하면 됩니다.

- `index.html`
- `app.js`

`styles.css`, `config.js`, `server/`는 건드리지 않아도 됩니다.

저장 시 실제 미리보기 DOM은 건드리지 않고, 1080×1080 PNG만 별도로 렌더링합니다.
