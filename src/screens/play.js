// PLAY: 발신자 이름 + Trick/Treat 문 두 개. 선택 즉시 받는 쪽에서 결과 확정.
import { roll } from '../game/roll.js';
import { savePlay } from '../store.js';
import { unlockAudio, sfx, vibrate } from '../audio.js';
import { escapeHtml } from '../util.js';

export function renderPlay({ app, events }, invite, onResult) {
  const { from, seed, parent, mirrorFrom } = invite;

  app.innerHTML = `
    <section class="screen play">
      ${parent ? `<div class="badge badge-revenge">😈 복수 초대장</div>` : ''}
      ${mirrorFrom ? `<div class="mirror-note">🪞 거울의 저주 발동 — ${escapeHtml(mirrorFrom)}의 사탕이 −20 되었다!</div>` : ''}
      <h1 class="play-title"><b>${escapeHtml(from)}</b>님이 보낸<br>저주받은 초대장</h1>
      <p class="hint">문 하나를 골라. 뒤에 뭐가 있을지는 아무도 몰라.</p>
      <div class="fog"></div>
      <div class="doors">
        <button class="door door-trick" data-choice="trick">
          <span class="door-emoji">😈</span><span class="door-label">TRICK</span>
        </button>
        <button class="door door-treat" data-choice="treat">
          <span class="door-emoji">🍬</span><span class="door-label">TREAT</span>
        </button>
      </div>
    </section>
  `;

  let chosen = false;
  app.querySelectorAll('.door').forEach(btn => {
    btn.addEventListener('click', () => {
      if (chosen) return;
      chosen = true;
      unlockAudio();
      sfx.door();
      vibrate([30, 50, 30]);

      const choice = btn.dataset.choice;
      const event = roll(events, choice); // 받는 쪽에서 선택 시점에 랜덤 확정
      const play = { from, choice, eventId: event.id, delta: event.delta, parent, at: Date.now() };
      // 미션은 판정 전이므로 delta는 RESULT에서 확정 후 다시 저장
      savePlay(seed, play);

      btn.classList.add('door-open');
      app.querySelector('.play').classList.add('choosing');

      setTimeout(() => onResult(play, { fresh: true }), 1500); // 연출 1.5초
    });
  });
}

// 자기가 만든 링크를 연 경우
export function renderOwnLink({ app }) {
  app.innerHTML = `
    <section class="screen own-link">
      <h1 class="screen-title">🙃 이건 네 초대장이야</h1>
      <p class="hint">이 링크는 친구에게 보내야 효과가 있어.<br>직접 열면 아무 일도 일어나지 않아!</p>
      <button class="btn-primary" id="go-home">홈으로</button>
    </section>
  `;
  app.querySelector('#go-home').addEventListener('click', () => {
    history.replaceState(null, '', location.pathname);
    dispatchEvent(new HashChangeEvent('hashchange'));
  });
}
