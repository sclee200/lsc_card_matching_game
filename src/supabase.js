import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getConfig() {
  const cfg = window.__APP_CONFIG__ || {};
  return {
    supabaseUrl: cfg.supabaseUrl || "",
    supabaseAnonKey: cfg.supabaseAnonKey || "",
    leaderboardLimit: Number(cfg.leaderboardLimit || 10)
  };
}

const { supabaseUrl, supabaseAnonKey, leaderboardLimit } = getConfig();

export const isSupabaseReady = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "YOUR_SUPABASE_URL" &&
    supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY"
);

export const supabase = isSupabaseReady ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const LEADERBOARD_LIMIT = leaderboardLimit;

export async function fetchLeaderboard() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("nickname, score, attempts, duration_ms, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(LEADERBOARD_LIMIT);
  if (error) throw error;
  return data || [];
}

export async function fetchMyBest(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from("game_scores")
    .select("score, attempts, duration_ms, created_at")
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveScore(row) {
  if (!supabase) return;
  const { error } = await supabase.from("game_scores").insert(row);
  if (error) throw error;
}

export function subscribeScoreInserts(onChange) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel("scores-feed")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_scores" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
