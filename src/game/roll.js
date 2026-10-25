// 가중 랜덤. 받는 쪽 브라우저에서 선택 시점에 확정 — 보낸 사람은 조작 불가.

export function randomFloat() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32; // [0, 1)
}

export function roll(events, choice) {
  const pool = events.filter(e => e.choice === choice);
  const total = pool.reduce((a, e) => a + e.weight, 0);
  let r = randomFloat() * total;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1];
}

// "{from}이(가) …" 치환. 받침 유무로 조사 선택.
export function fillText(text, from) {
  const hasBatchim = (() => {
    const code = from.charCodeAt(from.length - 1);
    if (code < 0xac00 || code > 0xd7a3) return null; // 한글 아님 → 병기 유지
    return (code - 0xac00) % 28 !== 0;
  })();
  let out = text.replaceAll('{from}', from);
  if (hasBatchim !== null) {
    out = out
      .replaceAll('이(가)', hasBatchim ? '이' : '가')
      .replaceAll('은(는)', hasBatchim ? '은' : '는');
  }
  return out;
}
