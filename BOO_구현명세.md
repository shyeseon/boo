# BOO! — Trick or Treat 공유형 웹앱 구현 명세

작성일: 2026-10-25 · 목표 배포: 2026-10-31 · 기준: 서버 없음, 정적 호스팅, 1인 개발 2일

---

## 1. 한 줄 정의

친구 이름을 넣은 "저주받은 할로윈 초대장" 링크를 보내면, 친구가 Trick 또는 Treat을 고르고 랜덤 결과(반전 포함)를 받은 뒤 복수 초대장을 만들어 다른 친구에게 보내는 30초짜리 공유 게임.

## 2. 설계 원칙

- **서버 없음.** 모든 상태는 URL 파라미터와 받는 쪽 기기의 localStorage에만 있다.
- **보낸 사람은 결과를 조작할 수 없다.** 결과는 받는 쪽 브라우저에서 선택 시점에 랜덤으로 확정한다.
- **Treat에도 나쁜 결과, Trick에도 좋은 결과.** 반전이 재미의 핵심.
- **한 플레이 30초.** 설명 없이 바로 선택할 수 있어야 한다.
- **재미는 코드가 아니라 문구·연출에서.** 이벤트 텍스트 25개 이상, 각각 짧고 웃기게.
- **사탕은 가상 점수.** 실물·현금 없음.

## 3. 사용자 흐름

```
[보내는 사람]
HOME ─▶ CREATE(닉네임 입력) ─▶ 링크 생성 ─▶ Web Share / 복사 ─▶ 메신저 전송

[받는 사람]
링크 접속 ─▶ PLAY(발신자 이름 + Trick/Treat 선택) ─▶ 연출 ─▶ RESULT(이벤트 + 사탕 변동)
         ─▶ [복수하기] ─▶ CREATE(내 닉네임, parent 포함) ─▶ 새 링크 전송
         ─▶ [결과 공유] ─▶ 결과 카드 이미지 저장·공유
```

- 링크를 **직접 만든 사람**이 자기 링크를 열면 PLAY 대신 "친구에게 보내세요" 안내.
- 같은 링크를 **두 번** 열면 첫 결과를 다시 보여준다(localStorage에 결과 저장).

## 4. 화면 명세

| 화면 | 라우트 | 구성 | 완료 조건 |
| --- | --- | --- | --- |
| HOME | `/` | 로고, 한 줄 설명, [장난 보내기], 내 사탕 바구니(누적 점수·칭호), 지난 결과 목록 | 버튼 탭 시 CREATE |
| CREATE | `/#create` | 닉네임 입력(2~10자), 미리보기 문구, [링크 만들기], 공유 바텀시트(Web Share / 복사) | 링크 생성 후 공유 |
| PLAY | `/?from=…&s=…` | "{from}님이 보낸 저주받은 초대장", 문 두 개(Trick / Treat), 선택 전 흔들림·안개 연출 | 선택 즉시 결과 확정 |
| RESULT | `/?from=…&s=…` (선택 후) | 이벤트 일러스트·제목·한 줄 문구, 사탕 변동(+/−), 미션형이면 미션 수행 UI, [복수하기] [결과 공유] | 복수 또는 공유 |

모바일 세로 기준. 데스크톱은 390px 폭 카드를 가운데 배치.

## 5. URL 설계

```
https://<host>/?from=<닉네임>&s=<시드>&p=<부모 시드>&v=1
```

| 파라미터 | 의미 | 비고 |
| --- | --- | --- |
| `from` | 보낸 사람 닉네임 | encodeURIComponent, 10자 제한 |
| `s` | 초대장 시드 (base36 8자) | 생성 시 `crypto.getRandomValues`, 초대장 ID 역할 |
| `p` | 부모 초대장 시드 | 복수 링크일 때만. 계보 추적·"복수 n단계" 표시용 |
| `v` | 포맷 버전 | 향후 파라미터 변경 대비 |

- `s`는 **결과 랜덤에 쓰지 않는다.** 결과는 받는 쪽에서 `Math.random()` 또는 `crypto.getRandomValues`로 뽑는다. (보낸 사람이 시드로 결과를 미리 알 수 없게)
- 파라미터 누락·깨짐 → HOME으로 보내고 "초대장이 깨졌어요" 토스트.

## 6. 이벤트 데이터 (`events.json`)

```json
[
  { "id": "candy",        "choice": "treat", "type": "gain",    "delta": 10,  "weight": 40, "title": "일반 사탕",        "text": "{from}이(가) 사탕 하나를 건넸다. 평범하다. 너무 평범하다." },
  { "id": "gold",         "choice": "treat", "type": "gain",    "delta": 100, "weight": 5,  "title": "황금 사탕",        "text": "황금빛 사탕! {from}은(는) 이걸 줄 생각이 없었다." },
  { "id": "cursed",       "choice": "treat", "type": "loss",    "delta": -20, "weight": 25, "title": "저주 사탕",        "text": "달콤한 줄 알았지? {from}의 저주가 담겨 있었다." },
  { "id": "rotten",       "choice": "treat", "type": "loss",    "delta": -5,  "weight": 20, "title": "썩은 사탕",        "text": "작년 할로윈에 남은 사탕이다. {from}, 양심 어디 갔니." },
  { "id": "double",       "choice": "treat", "type": "gain",    "delta": 30,  "weight": 10, "title": "두 배 사탕",       "text": "사탕이 두 개! {from}이(가) 실수로 두 개를 줬다." },
  { "id": "ghost",        "choice": "trick", "type": "loss",    "delta": -20, "weight": 25, "title": "유령 습격",        "text": "BOO! {from}이(가) 보낸 유령이 사탕을 훔쳐 갔다." },
  { "id": "dracula",      "choice": "trick", "type": "mission", "delta": 40,  "weight": 20, "title": "드라큘라 미션",    "text": "15초 안에 유령 15마리를 잡아라. 실패하면 사탕 −10.", "mission": "ghost_tap", "fail_delta": -10 },
  { "id": "witch_gift",   "choice": "trick", "type": "gain",    "delta": 50,  "weight": 15, "title": "마녀의 반전 선물", "text": "장난을 골랐는데 선물이 왔다. 마녀는 변덕쟁이다." },
  { "id": "pumpkin_bomb", "choice": "trick", "type": "loss",    "delta": -30, "weight": 15, "title": "호박 폭탄",        "text": "{from}이(가) 심어 둔 호박이 터졌다. 사탕이 사방으로." },
  { "id": "zombie_dance", "choice": "trick", "type": "mission", "delta": 30,  "weight": 15, "title": "좀비 댄스",        "text": "10초 동안 화면을 50번 두드려라. 좀비처럼.", "mission": "tap_50", "fail_delta": 0 },
  { "id": "mirror",       "choice": "trick", "type": "special", "delta": 0,   "weight": 10, "title": "거울의 저주",      "text": "장난이 {from}에게 되돌아갔다. 복수 링크를 보내면 {from}의 사탕이 −20.", "effect": "reflect" }
]
```

필드 규칙:

- `choice`: `treat` | `trick` — 어느 선택지에서 나오는지
- `type`: `gain` | `loss` | `mission` | `special`
- `weight`: 같은 `choice` 안에서의 가중치. **Treat 쪽 loss 합 ≈ 45%, Trick 쪽 gain+mission 합 ≈ 50%** 정도로 반전 비율 유지
- `mission`: `ghost_tap`(15초 유령 15마리 탭) | `tap_50`(10초 50탭). MVP는 이 2개만
- `{from}`: 발신자 닉네임 치환. 조사 처리는 `이(가)`, `은(는)`으로 병기

**문구 작성 원칙:** 발신자를 놀리거나 발신자가 당하는 구도. 1문장, 25자 내외, 이모지 없이 연출로 처리.

## 7. 핵심 로직

### 7.1 결과 확정

```js
function roll(choice) {
  const pool = EVENTS.filter(e => e.choice === choice);
  const total = pool.reduce((a, e) => a + e.weight, 0);
  let r = randomFloat() * total;          // crypto 기반
  for (const e of pool) { r -= e.weight; if (r <= 0) return e; }
  return pool[pool.length - 1];
}
```

- 선택 버튼 탭 → `roll()` → `localStorage.plays[s] = {from, choice, eventId, delta, at}` 저장 → 연출 1.5초 → RESULT.
- 이미 `plays[s]`가 있으면 PLAY를 건너뛰고 RESULT로.

### 7.2 미션 판정

| 미션 | 성공 조건 | 성공 | 실패 |
| --- | --- | --- | --- |
| `ghost_tap` | 15초 내 유령 15마리 탭 (0.6초마다 랜덤 위치 출현, 1초 뒤 사라짐) | +40 | −10 |
| `tap_50` | 10초 내 화면 50회 탭 | +30 | 0 |

미션 결과도 `plays[s].missionResult`에 저장, 재도전 불가.

### 7.3 사탕 바구니 (누적)

```js
basket = { total: 0, plays: 0, titles: [] }   // localStorage.basket
```

- 플레이마다 `total += delta` (0 아래로는 안 내려감).
- 칭호 (RESULT·HOME에 표시):
  - 사탕왕: total ≥ 200
  - 장난왕: trick 선택 5회 이상
  - 저주왕: loss 이벤트 5회 이상
  - 행운아: gold 1회 이상
- **보낸 사람 점수는 추적하지 않는다.** (서버 없이는 불가능. `mirror` 효과는 "다음 복수 링크에 `p`가 붙으면 받는 쪽 화면에 '{from}의 사탕이 −20' 문구만 표시" — 실제 차감 없음, 연출만)

### 7.4 복수 링크

- RESULT의 [복수하기] → CREATE로 이동, `p = 현재 s`를 자동 포함.
- CREATE에서 생성되는 새 링크: `?from=<내 닉네임>&s=<새 시드>&p=<현재 s>`
- 받는 쪽 PLAY 화면에 `p`가 있으면 "{from}의 복수 초대장 (n단계)" 배지. 단계 수는 로컬에서 알 수 없으므로 `p` 유무만으로 "복수"만 표시.

## 8. 결과 카드

- Canvas 1080×1350 (인스타 4:5). 구성: 이벤트 일러스트, 제목, 문구, 사탕 변동, 받은 사람 칭호, 하단 "너도 당해봐 → <host>" + QR.
- `canvas.toBlob` → `navigator.share({files})` 지원 시 파일 공유, 아니면 이미지 다운로드.
- 일러스트는 SVG 10종 (이벤트당 1개, 미션 2개는 공용). 직접 그리거나 CC0 아이콘.

## 9. 기술 스택·구조

| 항목 | 선택 |
| --- | --- |
| 프레임워크 | 바닐라 JS + Vite (빌드만) 또는 Alpine.js. Vue 3는 이 규모엔 과함 |
| 스타일 | 단일 CSS, CSS 변수로 테마(보라·주황·검정), 애니메이션은 CSS keyframes |
| 효과음 | Web Audio API, 첫 탭에서 unlock. 파일 4개: 문 열림, 사탕, 유령, 실패 |
| 진동 | `navigator.vibrate` 있으면 사용 (iOS 미지원 무시) |
| 저장 | localStorage: `basket`, `plays`, `settings` |
| 공유 | Web Share API → 폴백 `navigator.clipboard.writeText` → 폴백 input select+copy |
| 호스팅 | GitHub Pages 또는 Vercel. HTTPS 필수 (Web Share 조건) |
| OG | 고정 `og:image`(초대장 썸네일) + `og:title` "저주받은 할로윈 초대장이 도착했다". 동적 OG는 V2 |

```
boo/
├─ index.html
├─ src/
│  ├─ main.js          # 라우팅(URL 파라미터 → 화면), 초기화
│  ├─ screens/
│  │  ├─ home.js
│  │  ├─ create.js
│  │  ├─ play.js
│  │  └─ result.js
│  ├─ game/
│  │  ├─ roll.js       # 가중 랜덤
│  │  ├─ basket.js     # 누적 점수·칭호
│  │  └─ missions/
│  │     ├─ ghostTap.js
│  │     └─ tap50.js
│  ├─ share/
│  │  ├─ link.js       # URL 생성·파싱
│  │  └─ card.js       # Canvas 결과 카드
│  ├─ audio.js
│  └─ store.js         # localStorage 래퍼
├─ data/events.json
├─ assets/
│  ├─ svg/             # 이벤트 일러스트 10종
│  └─ sfx/             # 효과음 4개
├─ styles.css
├─ manifest.json
└─ sw.js               # 캐시만. 선택
```

## 10. 일정 (2일 + 여유)

| 날짜 | 작업 | 완료 기준 |
| --- | --- | --- |
| 10/26 | 라우팅, HOME·CREATE·PLAY·RESULT 뼈대, `roll()`, `events.json` 11종, 링크 생성·파싱, localStorage | 링크 만들고 다른 탭에서 열어 결과까지 |
| 10/27 | 복수 링크, 사탕 바구니·칭호, 미션 2개, 선택·결과 연출, 효과음, 이벤트 문구 25종으로 확장 | 복수 체인 3단계 동작 |
| 10/28 | 결과 카드 Canvas, Web Share, OG 메타, PWA manifest, 모바일 테스트(iOS Safari·Android Chrome·카카오 인앱) | 카카오톡에서 링크 미리보기 + 카드 공유 |
| 10/29~30 | 여유·버그·문구 다듬기, 배포 | 배포 URL에서 처음부터 끝까지 |
| 10/31 | 친구들에게 전송 | — |

## 11. 완료 기준 (수용 테스트)

- [ ] 닉네임 입력 → 링크 생성 → 카카오톡 전송까지 3탭 이내
- [ ] 받은 사람이 링크 열어 결과 보기까지 10초 이내
- [ ] 같은 링크 재접속 시 같은 결과
- [ ] Treat 100회 중 loss 35~55회, Trick 100회 중 gain·mission 40~60회 (콘솔 시뮬레이션)
- [ ] 복수 링크 → 받는 쪽에 "복수" 배지 표시
- [ ] 미션 2개 성공·실패 모두 점수 반영
- [ ] 결과 카드 이미지 저장 및 공유
- [ ] iOS Safari, Android Chrome, 카카오톡 인앱 브라우저에서 동작
- [ ] `?from=` 없이 열면 HOME

## 12. 범위 밖 (V2 후보)

- 서버 기반 결과 확정·중복 참여 완전 차단
- 보낸 사람 점수 추적, 전역 랭킹
- 동적 OG 미리보기(점수·닉네임 포함)
- 사탕 도감, 코스메틱
- 미션 추가 (빙고 기획서의 템플릿 8종 재활용 가능)
