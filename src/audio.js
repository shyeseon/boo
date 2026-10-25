// 효과음: Web Audio API로 합성 (파일 없이 4종 — 문 열림, 사탕, 유령, 실패).
// 첫 사용자 탭에서 AudioContext unlock.

let ctx = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlockAudio() { ensureCtx(); }

function tone({ type = 'sine', from, to = from, dur, gain = 0.2, delay = 0 }) {
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  door() { // 삐걱이는 문
    tone({ type: 'sawtooth', from: 120, to: 55, dur: 0.7, gain: 0.12 });
    tone({ type: 'square', from: 90, to: 40, dur: 0.7, gain: 0.05, delay: 0.08 });
  },
  candy() { // 밝은 획득음
    tone({ type: 'triangle', from: 523, to: 784, dur: 0.12, gain: 0.18 });
    tone({ type: 'triangle', from: 784, to: 1047, dur: 0.18, gain: 0.18, delay: 0.1 });
  },
  ghost() { // 우우~ 하강
    tone({ type: 'sine', from: 600, to: 180, dur: 0.8, gain: 0.15 });
    tone({ type: 'sine', from: 450, to: 140, dur: 0.8, gain: 0.08, delay: 0.1 });
  },
  fail() { // 부저
    tone({ type: 'square', from: 180, to: 110, dur: 0.35, gain: 0.12 });
    tone({ type: 'square', from: 150, to: 90, dur: 0.4, gain: 0.12, delay: 0.18 });
  },
};

export function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern); // iOS 미지원 무시
}
