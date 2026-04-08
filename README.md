# Card Matching Game

Vanilla Web(HTML/CSS/JavaScript) 기반 카드 뒤집기 게임입니다.  
Supabase Auth + Postgres + Realtime으로 로그인, 점수 저장, 실시간 랭킹을 제공합니다.

## 1) Supabase 설정

1. Supabase 프로젝트 생성
2. SQL Editor에서 아래 순서로 실행
   - `supabase/schema.sql`
   - `supabase/rls.sql`
3. Authentication > Providers에서 Email 활성화
4. Authentication > URL Configuration에 배포 URL 추가

## 2) 클라이언트 설정

`src/config.js` 파일의 값을 실제 값으로 수정:

```js
window.__APP_CONFIG__ = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
  leaderboardLimit: 10
};
```

## 3) 로컬 실행

정적 서버로 실행해야 모듈 import가 동작합니다.

```bash
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속.

## 4) Vercel 배포

1. Vercel에 리포지토리 연결
2. 정적 프로젝트로 배포
3. 배포 후 Supabase Auth Redirect URL에 Vercel 도메인 추가

## 5) 동작 요약

- 비로그인 상태: 게임 플레이 가능, 점수 저장 불가
- 로그인 상태: 게임 종료 시 `game_scores`에 저장
- 랭킹: `leaderboard_view` 조회 + Realtime INSERT 감지로 자동 갱신
