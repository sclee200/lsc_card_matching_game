import { fetchLeaderboard, fetchMyBest, subscribeScoreInserts } from "./supabase.js";
import { renderLeaderboard, setText } from "./ui.js";

export function createLeaderboardController({ listEl, myBestEl, messageEl, getCurrentUser }) {
  let unsubscribe = () => {};
  let refreshLock = false;
  let debounceTimer = null;

  async function refresh() {
    if (refreshLock) return;
    refreshLock = true;
    try {
      const [rows, user] = await Promise.all([fetchLeaderboard(), Promise.resolve(getCurrentUser())]);
      renderLeaderboard(listEl, rows);
      if (!user) {
        setText(myBestEl, "내 최고 점수: 로그인 후 확인 가능");
      } else {
        const best = await fetchMyBest(user.id);
        setText(myBestEl, best ? `내 최고 점수: ${best.score}` : "내 최고 점수: 아직 없음");
      }
    } catch (error) {
      setText(messageEl, `랭킹 로딩 오류: ${error.message}`);
    } finally {
      refreshLock = false;
    }
  }

  function onRealtimeChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      refresh();
    }, 250);
  }

  function start() {
    unsubscribe();
    unsubscribe = subscribeScoreInserts(onRealtimeChange);
    refresh();
  }

  function stop() {
    unsubscribe();
    clearTimeout(debounceTimer);
  }

  return { start, stop, refresh };
}
