// RESULT: 이벤트 일러스트·제목·문구, 사탕 변동, 미션 UI, [복수하기] [결과 공유]
import { fillText } from '../game/roll.js';
import { applyPlay, getBasket, titlesOf } from '../game/basket.js';
import { savePlay } from '../store.js';
import { artSvg } from '../art.js';
import { drawCard, shareCard } from '../share/card.js';
import { sfx, vibrate } from '../audio.js';
import { escapeHtml } from '../util.js';
import { runGhostTap } from '../game/missions/ghostTap.js';
import { runTap50 } from '../game/missions/tap50.js';

const MISSIONS = { ghost_tap: runGhostTap, tap_50: runTap50 };

export function renderResult(ctx, invite, play) {
  const { app, events, toast } = ctx;
  const event = events.find(e => e.id === play.eventId);
  if (!event) { toast('초대장이 깨졌어요'); location.href = location.pathname; return; }

  // 미션 이벤트이고 아직 판정 전이면 미션 화면부터
  if (event.type === 'mission' && play.missionResult === undefined) {
    renderMissionIntro();
    return;
  }

  // 바구니 반영 (최초 1회만 — 재접속 시 같은 결과만 다시 표시)
  if (!play.applied) {
    play.applied = true;
    applyPlay({ delta: play.delta, choice: play.choice, event });
    savePlay(invite.seed, play);
    if (play.delta > 0) { sfx.candy(); vibrate(60); }
    else if (play.delta < 0) { sfx.ghost(); vibrate([40, 60, 120]); }
  }

  renderFinal();

  function renderMissionIntro() {
    app.innerHTML = `
      <section class="screen result">
        <div class="result-art">${artSvg(event.art)}</div>
        <h1 class="result-title">${escapeHtml(event.title)}</h1>
        <p class="result-text">${escapeHtml(fillText(event.text, play.from))}</p>
        <button class="btn-primary" id="start-mission">⚡ 미션 시작</button>
      </section>
    `;
    app.querySelector('#start-mission').addEventListener('click', () => {
      app.innerHTML = `<section class="screen mission"><div id="mission-root"></div></section>`;
      const run = MISSIONS[event.mission];
      run(app.querySelector('#mission-root'), success => {
        // 미션 결과 저장 — 재도전 불가
        play.missionResult = success ? 'success' : 'fail';
        play.delta = success ? event.delta : (event.fail_delta ?? 0);
        savePlay(invite.seed, play);
        if (!success) sfx.fail();
        renderResult(ctx, invite, play);
      });
    });
  }

  function renderFinal() {
    const basket = getBasket();
    const titles = titlesOf(basket);
    const text = fillText(event.text, play.from);
    const missionBadge =
      play.missionResult === 'success' ? '<div class="badge badge-gain">미션 성공!</div>' :
      play.missionResult === 'fail' ? '<div class="badge badge-loss">미션 실패…</div>' : '';

    app.innerHTML = `
      <section class="screen result">
        <div class="result-art pop">${artSvg(event.art)}</div>
        ${missionBadge}
        <h1 class="result-title">${escapeHtml(event.title)}</h1>
        <p class="result-text">${escapeHtml(text)}</p>
        <div class="result-delta ${play.delta >= 0 ? 'gain' : 'loss'}">
          🍬 ${play.delta >= 0 ? '+' : ''}${play.delta}
        </div>
        <div class="basket-mini">내 바구니: 🍬 ${basket.total}
          ${titles.map(t => `<span class="badge">👑 ${t}</span>`).join('')}
        </div>
        <div class="result-actions">
          <button class="btn-primary" id="revenge">😈 복수하기</button>
          <button class="btn-ghost" id="share-card">📸 결과 공유</button>
        </div>
      </section>
    `;

    app.querySelector('#revenge').addEventListener('click', () => {
      // 거울의 저주면 복수 링크에 연출 파라미터(mx=원래 발신자) 포함
      const mx = event.effect === 'reflect' ? `&mx=${encodeURIComponent(play.from)}` : '';
      location.hash = `#create?p=${invite.seed}${mx}`;
    });

    app.querySelector('#share-card').addEventListener('click', async () => {
      const btn = app.querySelector('#share-card');
      btn.disabled = true;
      try {
        const canvas = await drawCard({ event, text, delta: play.delta, titles, host: location.host });
        const r = await shareCard(canvas);
        if (r === 'downloaded') toast('이미지를 저장했어!');
        if (r === 'failed') toast('카드 생성에 실패했어…');
      } catch {
        toast('카드 생성에 실패했어…');
      }
      btn.disabled = false;
    });
  }
}
