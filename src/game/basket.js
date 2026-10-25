// 사탕 바구니: 누적 점수·칭호
import { getBasket, saveBasket } from '../store.js';

export const TITLES = [
  { id: 'candy_king', label: '사탕왕', test: b => b.total >= 200 },
  { id: 'trick_king', label: '장난왕', test: b => b.trickCount >= 5 },
  { id: 'curse_king', label: '저주왕', test: b => b.lossCount >= 5 },
  { id: 'lucky',      label: '행운아', test: b => b.goldCount >= 1 },
];

export function titlesOf(basket) {
  return TITLES.filter(t => t.test(basket)).map(t => t.label);
}

// 플레이 1회 반영. delta는 미션 판정까지 끝난 최종 변동치.
export function applyPlay({ delta, choice, event }) {
  const b = getBasket();
  b.total = Math.max(0, b.total + delta); // 0 아래로는 안 내려감
  b.plays += 1;
  if (choice === 'trick') b.trickCount += 1;
  if (event.type === 'loss' || delta < 0) b.lossCount += 1;
  if (event.id === 'gold') b.goldCount += 1;
  saveBasket(b);
  return b;
}

export { getBasket };
