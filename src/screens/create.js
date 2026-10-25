// CREATE: 닉네임 입력(2~10자) → 링크 생성 → 공유 바텀시트
import { newSeed, buildLink, shareLink } from '../share/link.js';
import { shareKakao } from '../share/kakao.js';
import { addMine, getSettings, saveSettings } from '../store.js';
import { escapeHtml } from '../util.js';
import { unlockAudio, sfx } from '../audio.js';

// revenge: { parent, mirrorFrom } | null
export function renderCreate({ app, toast }, revenge = null) {
  const saved = getSettings().nickname;

  app.innerHTML = `
    <section class="screen create">
      <button class="btn-back" id="back">← 홈</button>
      <h1 class="screen-title">${revenge ? '😈 복수 초대장' : '🎃 초대장 만들기'}</h1>
      <p class="hint">받는 친구에게는 네 이름이 이렇게 보여:</p>
      <div class="preview-card" id="preview">
        "<b id="preview-name">???</b>님이 보낸 저주받은 초대장"
      </div>
      <input id="nickname" type="text" maxlength="10" placeholder="닉네임 (2~10자)"
             value="${escapeHtml(saved)}" autocomplete="off" />
      <button class="btn-primary" id="make">🔗 링크 만들기</button>

      <div class="sheet" id="sheet" hidden>
        <div class="sheet-body">
          <h2>초대장 완성!</h2>
          <input class="sheet-url" id="sheet-url" type="text" readonly />
          <button class="btn-kakao" id="share-kakao">💬 카카오톡으로 공유</button>
          <button class="btn-primary" id="share">📤 공유하기</button>
          <button class="btn-ghost" id="copy">📋 링크 복사</button>
        </div>
      </div>
    </section>
  `;

  const input = app.querySelector('#nickname');
  const previewName = app.querySelector('#preview-name');
  const sync = () => { previewName.textContent = input.value.trim() || '???'; };
  input.addEventListener('input', sync);
  sync();

  app.querySelector('#back').addEventListener('click', () => {
    history.replaceState(null, '', location.pathname);
    location.hash = '';
    dispatchEvent(new HashChangeEvent('hashchange'));
  });

  let link = null;
  app.querySelector('#make').addEventListener('click', async () => {
    unlockAudio();
    const name = input.value.trim();
    if (name.length < 2 || name.length > 10) {
      toast('닉네임은 2~10자로 해줘!');
      input.focus();
      return;
    }
    saveSettings({ ...getSettings(), nickname: name });
    const seed = newSeed();
    addMine(seed); // 내가 만든 링크 — 내가 열면 PLAY 대신 안내
    link = buildLink({
      from: name,
      seed,
      parent: revenge?.parent ?? null,
      mirrorFrom: revenge?.mirrorFrom ?? null,
    });
    sfx.candy();
    const urlBox = app.querySelector('#sheet-url');
    urlBox.value = link;
    app.querySelector('#sheet').hidden = false;
  });

  const SHARE_TEXT = '🎃 저주받은 할로윈 초대장이 도착했다. 열어볼 용기 있어?';
  app.querySelector('#share-kakao').addEventListener('click', async () => {
    if (!link) return;
    if (shareKakao({ url: link, from: input.value.trim() })) return;
    // 카카오 키 미설정·SDK 로드 실패 → 기본 공유로 폴백
    const r = await shareLink(link, SHARE_TEXT);
    if (r === 'copied') toast('카카오 공유가 준비되지 않아 링크를 복사했어!');
    else if (r === 'failed') toast('공유 실패. 링크를 직접 복사해 줘.');
  });
  app.querySelector('#share').addEventListener('click', async () => {
    if (!link) return;
    const r = await shareLink(link, SHARE_TEXT);
    if (r === 'copied') toast('링크를 복사했어! 메신저에 붙여넣어 줘.');
    if (r === 'failed') toast('공유에 실패했어. 링크를 직접 복사해 줘.');
  });
  app.querySelector('#copy').addEventListener('click', async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast('복사 완료!');
    } catch {
      // 인앱 브라우저 등 clipboard API 불가 → input 선택 + execCommand 폴백
      const urlBox = app.querySelector('#sheet-url');
      urlBox.focus();
      urlBox.select();
      urlBox.setSelectionRange(0, link.length);
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* 무시 */ }
      toast(ok ? '복사 완료!' : '복사 실패. 주소를 길게 눌러 복사해 줘.');
    }
  });
}
