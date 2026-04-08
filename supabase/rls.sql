alter table public.profiles enable row level security;
alter table public.game_scores enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "game_scores_select_authenticated" on public.game_scores;
create policy "game_scores_select_authenticated"
on public.game_scores
for select
to authenticated
using (true);

drop policy if exists "game_scores_insert_own" on public.game_scores;
create policy "game_scores_insert_own"
on public.game_scores
for insert
to authenticated
with check (auth.uid() = user_id);

grant select on public.leaderboard_view to authenticated;
