// localStorage 래퍼. 인앱 브라우저 등에서 접근이 막혀도 앱이 죽지 않게 try/catch.

const memory = {}; // localStorage 불가 시 세션 한정 폴백

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
  } catch { /* 접근 불가 또는 깨진 JSON */ }
  return key in memory ? memory[key] : fallback;
}

function write(key, value) {
  memory[key] = value;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 무시 */ }
}

// ── basket: 누적 사탕 점수 ──
export function getBasket() {
  return read('basket', { total: 0, plays: 0, trickCount: 0, lossCount: 0, goldCount: 0 });
}
export function saveBasket(basket) { write('basket', basket); }

// ── plays: 초대장 시드별 플레이 결과 (같은 링크 재접속 시 같은 결과) ──
export function getPlays() { return read('plays', {}); }
export function getPlay(seed) { return getPlays()[seed] ?? null; }
export function savePlay(seed, play) {
  const plays = getPlays();
  plays[seed] = play;
  write('plays', plays);
}

// ── mine: 내가 만든 초대장 시드 목록 (자기 링크를 열면 PLAY 대신 안내) ──
export function getMine() { return read('mine', []); }
export function addMine(seed) {
  const mine = getMine();
  if (!mine.includes(seed)) mine.push(seed);
  write('mine', mine);
}
export function isMine(seed) { return getMine().includes(seed); }

// ── settings ──
export function getSettings() { return read('settings', { nickname: '' }); }
export function saveSettings(settings) { write('settings', settings); }
