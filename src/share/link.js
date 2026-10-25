// 초대장 URL 생성·파싱
// https://<host>/?from=<닉네임>&s=<시드>&p=<부모 시드>&v=1

const SEED_RE = /^[0-9a-z]{8}$/;
export const FORMAT_VERSION = '1';

// base36 8자 시드. crypto.getRandomValues 기반 (결과 랜덤에는 쓰지 않음 — 초대장 ID 역할)
export function newSeed() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += (b % 36).toString(36);
  return out;
}

export function buildLink({ from, seed, parent = null, mirrorFrom = null }) {
  const url = new URL(location.origin + location.pathname);
  url.searchParams.set('from', from.slice(0, 10));
  url.searchParams.set('s', seed);
  if (parent) url.searchParams.set('p', parent);
  if (mirrorFrom) url.searchParams.set('mx', mirrorFrom.slice(0, 10)); // 거울의 저주 연출용
  url.searchParams.set('v', FORMAT_VERSION);
  return url.toString();
}

// 반환: { kind: 'home' } | { kind: 'invite', from, seed, parent, mirrorFrom }
//       | { kind: 'broken' } (파라미터가 있는데 깨진 경우 → HOME + 토스트)
export function parseParams() {
  const q = new URLSearchParams(location.search);
  const from = q.get('from');
  const seed = q.get('s');

  if (!from && !seed) return { kind: 'home' };

  const name = (from ?? '').trim().slice(0, 10);
  if (!name || !seed || !SEED_RE.test(seed)) return { kind: 'broken' };

  const parent = q.get('p');
  return {
    kind: 'invite',
    from: name,
    seed,
    parent: parent && SEED_RE.test(parent) ? parent : null,
    mirrorFrom: (q.get('mx') ?? '').trim().slice(0, 10) || null,
  };
}

// 공유: Web Share → clipboard → input select+copy 폴백
export async function shareLink(url, text) {
  const payload = { title: 'BOO!', text, url };
  if (navigator.share) {
    try { await navigator.share(payload); return 'shared'; }
    catch (err) { if (err.name === 'AbortError') return 'cancelled'; }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch { /* 폴백 계속 */ }
  const input = document.createElement('input');
  input.value = url;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* 무시 */ }
  input.remove();
  return ok ? 'copied' : 'failed';
}
