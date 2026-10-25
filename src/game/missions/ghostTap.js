// 드라큘라 미션: 15초 내 유령 15마리 탭.
// 유령은 0.6초마다 랜덤 위치 출현, 1초 뒤 사라짐.
import { sfx, vibrate } from '../../audio.js';

const DURATION = 15;
const TARGET = 15;
const SPAWN_MS = 600;
const LIFE_MS = 1000;

export function runGhostTap(container, onDone) {
  container.innerHTML = `
    <div class="mission-hud">
      <span class="mission-count">👻 0 / ${TARGET}</span>
      <span class="mission-timer">${DURATION}s</span>
    </div>
    <div class="mission-field"></div>
  `;
  const field = container.querySelector('.mission-field');
  const countEl = container.querySelector('.mission-count');
  const timerEl = container.querySelector('.mission-timer');

  let caught = 0;
  let finished = false;
  const timers = [];

  function finish(success) {
    if (finished) return;
    finished = true;
    timers.forEach(clearInterval);
    onDone(success);
  }

  function spawn() {
    if (finished) return;
    const g = document.createElement('button');
    g.type = 'button';
    g.className = 'mission-ghost';
    g.textContent = '👻';
    g.style.left = `${8 + Math.random() * 74}%`;
    g.style.top = `${8 + Math.random() * 74}%`;
    g.addEventListener('pointerdown', () => {
      if (finished || g.dataset.hit) return;
      g.dataset.hit = '1';
      g.classList.add('hit');
      caught += 1;
      countEl.textContent = `👻 ${caught} / ${TARGET}`;
      sfx.candy();
      vibrate(20);
      setTimeout(() => g.remove(), 150);
      if (caught >= TARGET) finish(true);
    }, { once: true });
    field.appendChild(g);
    setTimeout(() => g.remove(), LIFE_MS);
  }

  let remain = DURATION;
  timers.push(setInterval(() => {
    remain -= 1;
    timerEl.textContent = `${remain}s`;
    if (remain <= 0) finish(caught >= TARGET);
  }, 1000));
  timers.push(setInterval(spawn, SPAWN_MS));
  spawn();
}
