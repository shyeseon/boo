// 진입점: URL 파라미터·해시 → 화면 라우팅
import { parseParams } from './share/link.js';
import { getPlay, isMine } from './store.js';
import { renderHome } from './screens/home.js';
import { renderCreate } from './screens/create.js';
import { renderPlay, renderOwnLink } from './screens/play.js';
import { renderResult } from './screens/result.js';

const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2500);
}

let EVENTS = [];
const ctx = { app, toast, get events() { return EVENTS; } };

// #create?p=<부모 시드>&mx=<거울 피해자> 파싱
function parseHash() {
  const h = location.hash;
  if (!h.startsWith('#create')) return null;
  const q = new URLSearchParams(h.includes('?') ? h.slice(h.indexOf('?') + 1) : '');
  const p = q.get('p');
  return {
    parent: p && /^[0-9a-z]{8}$/.test(p) ? p : null,
    mirrorFrom: (q.get('mx') ?? '').trim().slice(0, 10) || null,
  };
}

function route() {
  const create = parseHash();
  if (create) { renderCreate(ctx, (create.parent || create.mirrorFrom) ? create : null); return; }

  const params = parseParams();
  if (params.kind === 'broken') {
    history.replaceState(null, '', location.pathname);
    renderHome(ctx);
    toast('초대장이 깨졌어요 👻');
    return;
  }
  if (params.kind === 'home') { renderHome(ctx); return; }

  // invite
  if (isMine(params.seed)) { renderOwnLink(ctx); return; }

  const played = getPlay(params.seed);
  if (played) { renderResult(ctx, params, played); return; } // 같은 링크 재접속 → 같은 결과

  renderPlay(ctx, params, play => renderResult(ctx, params, play));
}

async function init() {
  try {
    const res = await fetch('data/events.json');
    EVENTS = await res.json();
  } catch {
    app.innerHTML = '<section class="screen"><p class="hint">앗, 데이터를 불러오지 못했어요. 새로고침해 주세요.</p></section>';
    return;
  }
  route();
  addEventListener('hashchange', route);
}

init();

// 디버그·수용 테스트용: 콘솔에서 roll 분포 시뮬레이션
// 예: await window.booSimulate('treat', 100)
import('./game/roll.js').then(({ roll }) => {
  window.booSimulate = (choice, n = 100) => {
    const stats = {};
    for (let i = 0; i < n; i++) {
      const e = roll(EVENTS, choice);
      stats[e.type] = (stats[e.type] ?? 0) + 1;
    }
    return stats;
  };
});

// 서비스 워커 (캐시만, 선택)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
