// 좀비 댄스 미션: 10초 내 화면 50회 탭.
import { sfx, vibrate } from '../../audio.js';

const DURATION = 10;
const TARGET = 50;

export function runTap50(container, onDone) {
  container.innerHTML = `
    <div class="mission-hud">
      <span class="mission-count">🧟 0 / ${TARGET}</span>
      <span class="mission-timer">${DURATION}s</span>
    </div>
    <div class="mission-field tap-field"><span class="tap-hint">여기를 미친 듯이 탭!</span></div>
  `;
  const field = container.querySelector('.mission-field');
  const countEl = container.querySelector('.mission-count');
  const timerEl = container.querySelector('.mission-timer');

  let taps = 0;
  let finished = false;
  let timer = null;

  function finish(success) {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    onDone(success);
  }

  field.addEventListener('pointerdown', e => {
    if (finished) return;
    taps += 1;
    countEl.textContent = `🧟 ${taps} / ${TARGET}`;
    vibrate(10);
    if (taps % 10 === 0) sfx.candy();
    const fx = document.createElement('span');
    fx.className = 'tap-fx';
    const rect = field.getBoundingClientRect();
    fx.style.left = `${e.clientX - rect.left}px`;
    fx.style.top = `${e.clientY - rect.top}px`;
    field.appendChild(fx);
    setTimeout(() => fx.remove(), 400);
    if (taps >= TARGET) finish(true);
  });

  let remain = DURATION;
  timer = setInterval(() => {
    remain -= 1;
    timerEl.textContent = `${remain}s`;
    if (remain <= 0) finish(taps >= TARGET);
  }, 1000);
}
