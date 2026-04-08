const SYMBOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createDeck() {
  return shuffle(
    SYMBOLS.concat(SYMBOLS).map((symbol, index) => ({
      id: `card-${index}`,
      symbol,
      flipped: false,
      matched: false
    }))
  );
}

export function createGameState() {
  return {
    deck: createDeck(),
    attempts: 0,
    matchedPairs: 0,
    startedAt: null,
    finishedAt: null,
    lockBoard: false,
    selectedIds: []
  };
}

export function elapsedMs(state, now = Date.now()) {
  if (!state.startedAt) return 0;
  const end = state.finishedAt || now;
  return Math.max(0, end - state.startedAt);
}

export function calculateScore(attempts, durationMs) {
  const seconds = durationMs / 1000;
  const base = 1000;
  const attemptPenalty = attempts * 25;
  const timePenalty = Math.floor(seconds * 5);
  return Math.max(0, base - attemptPenalty - timePenalty);
}

export function startGame(state) {
  state.startedAt = Date.now();
}

export function restartGame(state) {
  const next = createGameState();
  Object.assign(state, next);
}

export function getCardById(state, cardId) {
  return state.deck.find((card) => card.id === cardId);
}

export function canFlip(state, card) {
  if (!card) return false;
  if (state.lockBoard) return false;
  if (card.flipped || card.matched) return false;
  return true;
}

export function flipCard(state, cardId) {
  const card = getCardById(state, cardId);
  if (!canFlip(state, card)) return { changed: false };

  if (!state.startedAt) startGame(state);

  card.flipped = true;
  state.selectedIds.push(card.id);

  if (state.selectedIds.length < 2) return { changed: true, needResolve: false };

  state.attempts += 1;
  const [firstId, secondId] = state.selectedIds;
  const first = getCardById(state, firstId);
  const second = getCardById(state, secondId);
  const isMatch = first && second && first.symbol === second.symbol;

  if (isMatch) {
    first.matched = true;
    second.matched = true;
    state.selectedIds = [];
    state.matchedPairs += 1;
    const finished = state.matchedPairs === SYMBOLS.length;
    if (finished) {
      state.finishedAt = Date.now();
    }
    return { changed: true, needResolve: false, isMatch: true, finished };
  }

  state.lockBoard = true;
  return { changed: true, needResolve: true, isMatch: false };
}

export function resolveMiss(state) {
  const [firstId, secondId] = state.selectedIds;
  const first = getCardById(state, firstId);
  const second = getCardById(state, secondId);

  if (first) first.flipped = false;
  if (second) second.flipped = false;

  state.selectedIds = [];
  state.lockBoard = false;
}
