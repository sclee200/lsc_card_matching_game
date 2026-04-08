import { calculateScore, createGameState, elapsedMs, flipCard, resolveMiss, restartGame } from "./game.js";
import { ensureProfile, getSessionUser, onAuthChange, signInWithEmail, signOut, signUpWithEmail } from "./auth.js";
import { isSupabaseReady, saveScore } from "./supabase.js";
import { createLeaderboardController } from "./leaderboard.js";
import { qs, renderBoard, setText, toggleHidden } from "./ui.js";

const boardEl = qs("board");
const attemptsEl = qs("attempts");
const timeEl = qs("time");
const scoreEl = qs("score");
const messageEl = qs("message");
const restartBtn = qs("restartBtn");
const authForm = qs("authForm");
const emailInput = qs("emailInput");
const passwordInput = qs("passwordInput");
const sessionStatusEl = qs("sessionStatus");
const loginBtn = qs("loginBtn");
const logoutBtn = qs("logoutBtn");
const leaderboardEl = qs("leaderboard");
const myBestEl = qs("myBest");

const state = createGameState();
let currentUser = null;
let clockTimer = null;
let resultSaved = false;
let authPending = false;

const leaderboard = createLeaderboardController({
  listEl: leaderboardEl,
  myBestEl,
  messageEl,
  getCurrentUser: () => currentUser
});

function tickStats() {
  setText(attemptsEl, String(state.attempts));
  const ms = elapsedMs(state);
  setText(timeEl, `${(ms / 1000).toFixed(1)}s`);
  setText(scoreEl, String(calculateScore(state.attempts, ms)));
}

function drawBoard() {
  renderBoard(boardEl, state.deck, handleFlip);
}

function startClock() {
  stopClock();
  clockTimer = setInterval(tickStats, 100);
}

function stopClock() {
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = null;
}

async function saveResultIfPossible() {
  if (!isSupabaseReady || !currentUser || resultSaved || !state.finishedAt) return;
  resultSaved = true;
  const duration = elapsedMs(state, state.finishedAt);
  const score = calculateScore(state.attempts, duration);
  try {
    await saveScore({
      user_id: currentUser.id,
      attempts: state.attempts,
      duration_ms: duration,
      score
    });
    await leaderboard.refresh();
  } catch (error) {
    setText(messageEl, `점수 저장 실패: ${error.message}`);
    resultSaved = false;
  }
}

async function handleFlip(cardId) {
  const result = flipCard(state, cardId);
  if (!result.changed) return;

  drawBoard();
  tickStats();

  if (result.needResolve) {
    setTimeout(() => {
      resolveMiss(state);
      drawBoard();
    }, 700);
    return;
  }

  if (result.isMatch && !result.finished) {
    setText(messageEl, "매칭 성공!");
  }

  if (result.finished) {
    stopClock();
    const duration = elapsedMs(state, state.finishedAt);
    const score = calculateScore(state.attempts, duration);
    setText(messageEl, `게임 완료! ${state.attempts}회, ${(duration / 1000).toFixed(1)}초, 점수 ${score}`);
    await saveResultIfPossible();
  } else {
    startClock();
  }
}

function resetGame() {
  restartGame(state);
  resultSaved = false;
  setText(messageEl, "새 게임을 시작합니다.");
  drawBoard();
  tickStats();
  stopClock();
}

async function updateSession(user) {
  currentUser = user;
  if (currentUser) {
    await ensureProfile(currentUser);
    setText(sessionStatusEl, `로그인: ${currentUser.email}`);
    toggleHidden(loginBtn, true);
    toggleHidden(logoutBtn, false);
  } else {
    setText(sessionStatusEl, "비로그인 상태");
    toggleHidden(loginBtn, false);
    toggleHidden(logoutBtn, true);
  }
  await leaderboard.refresh();
}

function bindEvents() {
  restartBtn.addEventListener("click", resetGame);
  loginBtn.addEventListener("click", () => emailInput.focus());
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut();
    } catch (error) {
      setText(messageEl, `로그아웃 오류: ${error.message}`);
    }
  });
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (authPending) return;
    if (!isSupabaseReady) {
      setText(messageEl, "config.js에 Supabase 설정을 먼저 입력하세요.");
      return;
    }

    const submitter = event.submitter;
    const authAction = submitter?.value || "";
    if (authAction !== "signIn" && authAction !== "signUp") {
      setText(messageEl, "로그인 또는 회원가입 버튼으로 시도하세요.");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    authPending = true;
    submitter.disabled = true;
    try {
      const user =
        authAction === "signIn"
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);

      await updateSession(user || (await getSessionUser()));
      setText(messageEl, authAction === "signIn" ? "로그인 완료" : "회원가입 완료");
    } catch (error) {
      const text = String(error.message || "");
      if (text.includes("rate limit")) {
        setText(messageEl, "요청이 너무 많아 잠시 차단되었습니다. 잠시 후 다시 시도하세요.");
      } else if (authAction === "signUp" && text.includes("User already registered")) {
        setText(messageEl, "이미 가입된 이메일입니다. 로그인 버튼을 사용하세요.");
      } else {
        setText(messageEl, `${authAction === "signIn" ? "로그인" : "회원가입"} 실패: ${error.message}`);
      }
    } finally {
      authPending = false;
      submitter.disabled = false;
    }
  });
}

async function init() {
  drawBoard();
  tickStats();
  bindEvents();

  if (!isSupabaseReady) {
    setText(sessionStatusEl, "Supabase 미설정");
    setText(messageEl, "src/config.js에 Supabase URL/Anon Key를 설정하세요.");
    renderBoard(boardEl, state.deck, handleFlip);
    return;
  }

  onAuthChange((user) => {
    updateSession(user);
  });
  const user = await getSessionUser();
  await updateSession(user);
  leaderboard.start();
}

init();
