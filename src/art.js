// 이벤트 일러스트 SVG. JS 템플릿 문자열로 보관 — DOM 삽입과 Canvas drawImage 양쪽에 바로 사용.
// width/height 명시는 canvas 렌더링(iOS Safari) 필수.

const wrap = inner =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">${inner}</svg>`;

export const ART = {
  candy: wrap(`
    <ellipse cx="60" cy="60" rx="26" ry="22" fill="#ff7a1a"/>
    <path d="M34 60 L14 44 L20 60 L14 76 Z" fill="#ffb366"/>
    <path d="M86 60 L106 44 L100 60 L106 76 Z" fill="#ffb366"/>
    <path d="M46 48 q8 12 0 24 M60 44 q8 16 0 32 M74 48 q8 12 0 24" stroke="#b34700" stroke-width="4" fill="none" stroke-linecap="round"/>
  `),
  gold: wrap(`
    <ellipse cx="60" cy="60" rx="26" ry="22" fill="#ffd21a"/>
    <path d="M34 60 L14 44 L20 60 L14 76 Z" fill="#ffe680"/>
    <path d="M86 60 L106 44 L100 60 L106 76 Z" fill="#ffe680"/>
    <path d="M60 46 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1 Z" fill="#b38600"/>
    <circle cx="42" cy="30" r="3" fill="#ffd21a"/><circle cx="84" cy="24" r="2.5" fill="#ffd21a"/><circle cx="98" cy="90" r="3" fill="#ffd21a"/>
  `),
  ghost: wrap(`
    <path d="M60 18 q-30 0 -30 34 v44 l10 -8 10 8 10 -8 10 8 10 -8 10 8 v-44 q0 -34 -30 -34" fill="#f2ecff"/>
    <circle cx="50" cy="52" r="5" fill="#241733"/><circle cx="72" cy="52" r="5" fill="#241733"/>
    <ellipse cx="61" cy="68" rx="6" ry="9" fill="#241733"/>
  `),
  pumpkin: wrap(`
    <ellipse cx="60" cy="68" rx="38" ry="32" fill="#ff7a1a"/>
    <ellipse cx="38" cy="68" rx="14" ry="30" fill="none" stroke="#cc5500" stroke-width="3"/>
    <ellipse cx="82" cy="68" rx="14" ry="30" fill="none" stroke="#cc5500" stroke-width="3"/>
    <rect x="55" y="22" width="10" height="16" rx="4" fill="#3f7a2e"/>
    <path d="M38 58 l12 10 -24 0 Z M82 58 l12 10 -24 0 Z" fill="#241733"/>
    <path d="M36 82 l8 8 8 -8 8 8 8 -8 8 8 8 -8 -4 12 q-20 8 -40 0 Z" fill="#241733"/>
  `),
  skull: wrap(`
    <path d="M60 20 q-32 0 -32 32 q0 18 12 24 v14 h40 v-14 q12 -6 12 -24 q0 -32 -32 -32" fill="#e8e3f0"/>
    <circle cx="47" cy="54" r="8" fill="#241733"/><circle cx="73" cy="54" r="8" fill="#241733"/>
    <path d="M60 64 l-6 10 h12 Z" fill="#241733"/>
    <rect x="48" y="90" width="5" height="10" fill="#e8e3f0"/><rect x="58" y="90" width="5" height="10" fill="#e8e3f0"/><rect x="68" y="90" width="5" height="10" fill="#e8e3f0"/>
  `),
  spider: wrap(`
    <line x1="60" y1="0" x2="60" y2="38" stroke="#aaa" stroke-width="2"/>
    <circle cx="60" cy="60" r="18" fill="#241733"/>
    <circle cx="60" cy="40" r="10" fill="#241733"/>
    <circle cx="56" cy="38" r="2.5" fill="#ff7a1a"/><circle cx="64" cy="38" r="2.5" fill="#ff7a1a"/>
    <path d="M44 54 Q24 44 18 28 M44 62 Q22 60 12 50 M44 70 Q24 76 16 90 M76 54 Q96 44 102 28 M76 62 Q98 60 108 50 M76 70 Q96 76 104 90" stroke="#241733" stroke-width="4" fill="none" stroke-linecap="round"/>
  `),
  bat: wrap(`
    <path d="M60 50 Q40 30 12 36 Q28 44 26 56 Q40 52 46 62 Z" fill="#4a3566"/>
    <path d="M60 50 Q80 30 108 36 Q92 44 94 56 Q80 52 74 62 Z" fill="#4a3566"/>
    <ellipse cx="60" cy="60" rx="14" ry="18" fill="#241733"/>
    <path d="M52 46 l-4 -10 6 4 Z M68 46 l4 -10 -6 4 Z" fill="#241733"/>
    <circle cx="55" cy="56" r="3" fill="#ffd21a"/><circle cx="65" cy="56" r="3" fill="#ffd21a"/>
  `),
  cat: wrap(`
    <ellipse cx="60" cy="78" rx="26" ry="22" fill="#241733"/>
    <circle cx="60" cy="46" r="20" fill="#241733"/>
    <path d="M44 34 l-4 -16 12 8 Z M76 34 l4 -16 -12 8 Z" fill="#241733"/>
    <circle cx="52" cy="44" r="4" fill="#8fe06a"/><circle cx="68" cy="44" r="4" fill="#8fe06a"/>
    <path d="M86 78 q18 -2 14 -20" stroke="#241733" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M56 52 l4 4 4 -4" stroke="#ff7a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  `),
  witch: wrap(`
    <path d="M60 10 L40 48 L84 48 Z" fill="#4a3566"/>
    <rect x="30" y="46" width="60" height="7" rx="3.5" fill="#4a3566"/>
    <circle cx="60" cy="68" r="17" fill="#ffe0c2"/>
    <path d="M44 92 q16 12 32 0 l4 14 h-40 Z" fill="#6b4ba1"/>
    <circle cx="54" cy="66" r="2.8" fill="#241733"/><circle cx="66" cy="66" r="2.8" fill="#241733"/>
    <path d="M55 75 q5 4 10 0" stroke="#241733" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M60 24 l2.5 5.5 6 0.8 -4.3 4.2 1 6 -5.2 -3 -5.2 3 1 -6 -4.3 -4.2 6 -0.8 Z" fill="#ffd21a"/>
  `),
  mirror: wrap(`
    <ellipse cx="60" cy="54" rx="28" ry="36" fill="#9db4ff" stroke="#6b4ba1" stroke-width="6"/>
    <path d="M48 32 q-10 14 0 36" stroke="#e8efff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="54" y="92" width="12" height="18" rx="4" fill="#6b4ba1"/>
    <path d="M66 44 q8 6 0 16" stroke="#4a3566" stroke-width="3" fill="none" stroke-linecap="round"/>
  `),
  mission: wrap(`
    <circle cx="60" cy="60" r="40" fill="none" stroke="#ff7a1a" stroke-width="7"/>
    <line x1="60" y1="60" x2="60" y2="34" stroke="#f2ecff" stroke-width="6" stroke-linecap="round"/>
    <line x1="60" y1="60" x2="78" y2="68" stroke="#f2ecff" stroke-width="6" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="5" fill="#ffd21a"/>
    <path d="M60 8 l6 10 h-12 Z" fill="#ff7a1a"/>
  `),
};

export function artSvg(key) { return ART[key] ?? ART.candy; }
