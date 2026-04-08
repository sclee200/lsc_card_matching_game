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

## 2) 클라이언트 설정 (환경변수 기반)

이 프로젝트는 빌드 시 `src/config.js`를 자동 생성합니다.
(`src/config.js`는 git에 커밋되지 않음)

### 로컬

```bash
SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" \
LEADERBOARD_LIMIT="10" \
npm run prepare:config
```

### Vercel

Vercel 프로젝트 Settings > Environment Variables에 아래 3개 등록:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `LEADERBOARD_LIMIT` (선택, 기본값 10)

## 3) 로컬 실행

정적 서버로 실행해야 모듈 import가 동작합니다.

```bash
npm run prepare:config
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속.

## 4) Vercel 배포

1. Vercel에 리포지토리 연결
2. Environment Variables에 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 추가
3. 배포 후 Supabase Auth Redirect URL에 Vercel 도메인 추가

## 5) 동작 요약

- 비로그인 상태: 게임 플레이 가능, 점수 저장 불가
- 로그인 상태: 게임 종료 시 `game_scores`에 저장
- 랭킹: `leaderboard_view` 조회 + Realtime INSERT 감지로 자동 갱신
