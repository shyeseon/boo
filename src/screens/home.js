// HOME: 로고, 한 줄 설명, [장난 보내기], 내 사탕 바구니(점수·칭호), 지난 결과 목록
import { getBasket, titlesOf } from '../game/basket.js';
import { getPlays } from '../store.js';
import { escapeHtml } from '../util.js';

export function renderHome({ app, events }) {
  const basket = getBasket();
  const titles = titlesOf(basket);
  const plays = Object.entries(getPlays())
    .sort((a, b) => b[1].at - a[1].at)
    .slice(0, 10);
  const eventById = Object.fromEntries(events.map(e => [e.id, e]));

  app.innerHTML = `
    <section class="screen home">
      <h1 class="logo">BOO!</h1>
      <p class="tagline">저주받은 할로윈 초대장을 보내자.<br>Trick or Treat — 결과는 아무도 모른다.</p>
      <button class="btn-primary" id="go-create">🎃 장난 보내기</button>

      <div class="basket-card">
        <div class="basket-total">🍬 ${basket.total}</div>
        <div class="basket-sub">${basket.plays}번 플레이</div>
        ${titles.length ? `<div class="basket-titles">${titles.map(t => `<span class="badge">👑 ${t}</span>`).join('')}</div>` : ''}
      </div>

      ${plays.length ? `
      <div class="history">
        <h2>지난 결과</h2>
        <ul>
          ${plays.map(([, p]) => {
            const ev = eventById[p.eventId];
            return `<li>
              <span class="history-title">${escapeHtml(ev?.title ?? '?')}</span>
              <span class="history-from">from ${escapeHtml(p.from)}</span>
              <span class="history-delta ${p.delta >= 0 ? 'gain' : 'loss'}">${p.delta >= 0 ? '+' : ''}${p.delta}</span>
            </li>`;
          }).join('')}
        </ul>
      </div>` : ''}
    </section>
  `;

  app.querySelector('#go-create').addEventListener('click', () => {
    location.hash = '#create';
  });
}
