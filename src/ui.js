export function qs(id) {
  return document.getElementById(id);
}

export function renderBoard(boardEl, deck, onFlip) {
  boardEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  deck.forEach((card) => {
    const button = document.createElement("button");
    button.className = "card";
    if (card.flipped) button.classList.add("flipped");
    if (card.matched) button.classList.add("matched");
    button.type = "button";
    button.dataset.cardId = card.id;
    button.textContent = card.symbol;
    button.disabled = card.matched;
    button.setAttribute("aria-label", `card ${card.id}`);
    button.addEventListener("click", () => onFlip(card.id));
    fragment.appendChild(button);
  });
  boardEl.appendChild(fragment);
}

export function setText(el, value) {
  if (el) el.textContent = value;
}

export function renderLeaderboard(listEl, rows) {
  listEl.innerHTML = "";
  if (!rows.length) {
    const li = document.createElement("li");
    li.textContent = "아직 기록이 없습니다.";
    listEl.appendChild(li);
    return;
  }

  rows.forEach((row, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${row.nickname} - ${row.score}점 (${(row.duration_ms / 1000).toFixed(1)}s, ${row.attempts}회)`;
    listEl.appendChild(li);
  });
}

export function toggleHidden(el, hidden) {
  if (!el) return;
  el.classList.toggle("hidden", hidden);
}
