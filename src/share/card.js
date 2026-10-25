// 결과 카드: Canvas 1080×1350 (인스타 4:5) → Web Share(files) 또는 다운로드.
import { artSvg } from '../art.js';

const W = 1080;
const H = 1350;

function svgToImage(svg, size) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image(size, size);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

// qrcodejs(CDN)로 QR 생성 후 내부 canvas/img를 반환. 로드 실패 시 null → URL 텍스트로 대체.
function makeQr(text, size) {
  if (typeof QRCode === 'undefined') return null;
  const holder = document.createElement('div');
  holder.style.position = 'fixed';
  holder.style.left = '-9999px';
  document.body.appendChild(holder);
  try {
    new QRCode(holder, { text, width: size, height: size, correctLevel: QRCode.CorrectLevel.M });
    return { el: holder.querySelector('canvas') ?? holder.querySelector('img'), holder };
  } catch {
    holder.remove();
    return null;
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (ctx.measureText(probe).width > maxWidth && line) { lines.push(line); line = w; }
    else line = probe;
  }
  if (line) lines.push(line);
  return lines;
}

export async function drawCard({ event, text, delta, titles, host }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 배경: 밤하늘 그라데이션 + 비네트
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#241733');
  bg.addColorStop(0.6, '#1a1025');
  bg.addColorStop(1, '#0f0a18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 별
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 60; i++) {
    const x = (i * 97.3) % W;
    const y = (i * 211.7) % (H * 0.5);
    ctx.fillRect(x, y, i % 3 === 0 ? 4 : 2, i % 3 === 0 ? 4 : 2);
  }

  // 상단 로고
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff7a1a';
  ctx.font = 'bold 90px sans-serif';
  ctx.fillText('BOO!', W / 2, 150);

  // 일러스트
  const img = await svgToImage(artSvg(event.art), 460);
  ctx.drawImage(img, (W - 460) / 2, 220, 460, 460);

  // 제목
  ctx.fillStyle = '#f2ecff';
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText(event.title, W / 2, 800);

  // 문구 (줄바꿈)
  ctx.font = '42px sans-serif';
  ctx.fillStyle = '#c9bfe0';
  wrapText(ctx, text, W - 160).forEach((line, i) => {
    ctx.fillText(line, W / 2, 880 + i * 60);
  });

  // 사탕 변동
  ctx.font = 'bold 96px sans-serif';
  ctx.fillStyle = delta >= 0 ? '#8fe06a' : '#ff5a5a';
  ctx.fillText(`🍬 ${delta >= 0 ? '+' : ''}${delta}`, W / 2, 1090);

  // 칭호
  if (titles.length) {
    ctx.font = '38px sans-serif';
    ctx.fillStyle = '#ffd21a';
    ctx.fillText(titles.map(t => `👑 ${t}`).join('  '), W / 2, 1150);
  }

  // 하단: 링크 + QR
  ctx.font = 'bold 40px sans-serif';
  ctx.fillStyle = '#ff7a1a';
  ctx.textAlign = 'left';
  ctx.fillText('너도 당해봐 →', 90, 1280);
  ctx.font = '34px sans-serif';
  ctx.fillStyle = '#c9bfe0';
  ctx.fillText(host, 90, 1326);

  const qr = makeQr(`https://${host}`, 160);
  if (qr?.el) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(W - 270, 1160, 180, 180);
    ctx.drawImage(qr.el, W - 260, 1170, 160, 160);
    qr.holder.remove();
  }

  return canvas;
}

export async function shareCard(canvas, filename = 'boo-result.png') {
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
  if (!blob) return 'failed';
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'BOO!' }); return 'shared'; }
    catch (err) { if (err.name === 'AbortError') return 'cancelled'; }
  }
  // 폴백: 다운로드
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}
