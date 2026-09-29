# Member Profile Card v13

이 버전은 **GitHub Pages + Render 서버** 조합으로
`모스트 1 선택 -> AI 배경 생성 -> 카드 배경 자동 교체`가 되도록 정리한 버전입니다.

## 구성
- **GitHub Pages**: 카드 웹사이트 정적 파일 호스팅
- **Render**: `/api/generate-character` 서버 실행, OpenAI 이미지 생성 호출

## 핵심 파일
- `index.html`, `styles.css`, `app.js` : 카드 프론트엔드
- `config.js` : Render 서버 주소 입력
- `server/server.js` : OpenAI 이미지 API 연결 서버
- `server/.env.example` : 환경변수 예시
- `server/render.yaml` : Render 배포 참고 파일

## 1) GitHub Pages용 설정
GitHub Pages에 올리기 전에 `config.js`를 열어서 아래처럼 Render 주소를 넣으세요.

```js
window.WOOJU_CONFIG = {
  apiBaseUrl: 'https://YOUR-RENDER-SERVICE.onrender.com'
};
```

이걸 넣어야 GitHub Pages에서 버튼을 눌렀을 때 Render 서버로 요청이 갑니다.

## 2) Render 서버 배포
`server` 폴더를 Render에 배포하거나, 이 프로젝트를 올린 뒤 Root Directory를 `server`로 지정하세요.

환경변수는 아래처럼 설정하면 됩니다.

- `OPENAI_API_KEY` = 본인 키
- `OPENAI_IMAGE_MODEL` = `gpt-image-1`
- `ALLOWED_ORIGIN` = GitHub Pages 주소
  - 예: `https://YOUR_USERNAME.github.io`
  - 리포지토리 페이지면 `https://YOUR_USERNAME.github.io/REPO_NAME` 를 써도 되지만, 기본적으로 origin 값은 도메인까지만 들어오므로 보통 `https://YOUR_USERNAME.github.io` 권장

## 3) 동작 흐름
1. 사용자가 모스트 1 선택
2. `AI 배경 생성` 클릭
3. GitHub Pages의 프론트가 `config.js`의 Render 주소로 POST 요청
4. Render 서버가 OpenAI Images API 호출
5. 생성된 배경 이미지를 base64로 받아 프론트에 전달
6. 카드의 **배경 레이어만 자동 교체**

## 로컬 테스트
GitHub Pages 없이도 로컬에서 테스트할 수 있습니다.

```bash
cd server
npm install
npm start
```

그 뒤 브라우저에서 `http://localhost:3000` 접속.

## 주의
- API 키는 절대 프론트엔드 JS에 넣지 마세요.
- AI는 **배경 그림만 생성**하도록 프롬프트가 이미 작성되어 있습니다.
- GitHub Pages는 정적 호스팅이라 서버 코드가 직접 돌지 않습니다. 반드시 Render 같은 별도 서버가 필요합니다.
