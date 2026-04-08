create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 24),
  created_at timestamptz not null default now()
);

create table if not exists public.game_scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  attempts int not null check (attempts > 0 and attempts < 500),
  duration_ms int not null check (duration_ms > 0 and duration_ms < 3600000),
  score int not null check (score >= 0 and score <= 10000),
  created_at timestamptz not null default now()
);

create index if not exists game_scores_rank_idx on public.game_scores (score desc, created_at asc);
create index if not exists game_scores_user_best_idx on public.game_scores (user_id, score desc);

create or replace view public.leaderboard_view as
select
  gs.id,
  gs.user_id,
  coalesce(p.nickname, 'anonymous') as nickname,
  gs.attempts,
  gs.duration_ms,
  gs.score,
  gs.created_at
from public.game_scores gs
left join public.profiles p on p.id = gs.user_id;
