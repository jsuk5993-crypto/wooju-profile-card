# WOOJU Profile Card v17 — dual reference AI background

이 버전부터 AI 배경은 텍스트만으로 생성하지 않습니다.

1. 사용자가 **모스트1** 챔피언을 선택합니다.
2. Render 서버가 Riot Data Dragon에서 해당 챔피언의 **공식 기본 Splash 이미지**를 자동으로 가져옵니다.
3. `server/style-reference.png`를 **퀄리티/구도 레퍼런스**로 함께 전달합니다. 이 파일은 사용자가 승인한 오른쪽 예시 이미지에서 UI를 제거하고 핵심 아트 부분만 잘라 둔 이미지입니다.
4. OpenAI `gpt-image-2.5-sunburst`의 **Images Edit API**에 두 이미지를 함께 넣습니다.
5. 생성 결과의 배경 이미지만 기존 카드에 자동 삽입됩니다.

## 두 레퍼런스의 역할
- 입력 이미지 1: 공식 챔피언 Splash — 챔피언 정체성 전용
- 입력 이미지 2: style-reference.png — 렌더링 퀄리티/광원/구도/역동성 전용

프롬프트와 서버 양쪽에서 이미지 2의 닐라 외형/물 이펙트/색상을 다른 챔피언에게 복사하지 말도록 강하게 제한했습니다.

## 기존 GitHub/Render에 적용할 파일
GitHub 저장소에서 다음 파일을 교체/추가하세요.

- `app.js` 교체
- `server/server.js` 교체
- `server/package.json` 교체
- `server/style-reference.png` **새로 추가**

`index.html`, `styles.css`, `config.js`, assets는 그대로 사용하면 됩니다.

## Render
새 Web Service를 만들 필요 없습니다. 기존 `wooju-ai`를 그대로 사용하세요. GitHub 커밋 후 자동 배포가 켜져 있으면 기다리고, 꺼져 있으면 **Manual Deploy → Deploy latest commit**만 하면 됩니다.

기존 `OPENAI_API_KEY`, `ALLOWED_ORIGIN`은 그대로 사용합니다.
`OPENAI_IMAGE_MODEL=gpt-image-1` 환경변수가 남아 있어도 이 v17에서는 사용하지 않습니다. 기본 편집 모델은 `gpt-image-2.5-sunburst`입니다.
원하면 새 환경변수 `OPENAI_EDIT_MODEL=gpt-image-2.5-sunburst`를 추가할 수 있지만 없어도 동작합니다.

## 테스트
Render 배포 완료 후 GitHub Pages에서 Ctrl+F5를 하고:

모스트1 선택 → AI 배경 생성 → 생성 완료 후 카드 배경 자동 교체

서버 상태 확인 주소:
`https://wooju-ai.onrender.com/api/health`

정상이라면 `referenceMode: official-champion+style`이 표시됩니다.
