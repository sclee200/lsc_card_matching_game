import { supabase } from "./supabase.js";

export async function getSessionUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user || null;
}

export async function signInWithEmail(email, password) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUpWithEmail(email, password) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => {
    data.subscription.unsubscribe();
  };
}

export async function ensureProfile(user) {
  if (!supabase || !user) return;
  const nickname = (user.email || "guest").split("@")[0];
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, nickname }, { onConflict: "id" });
  if (error) throw error;
}
