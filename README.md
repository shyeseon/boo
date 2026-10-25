# BOO! — 저주받은 할로윈 초대장

친구 이름을 넣은 "저주받은 할로윈 초대장" 링크를 보내면, 친구가 Trick / Treat을 고르고
랜덤 결과(반전 포함)를 받은 뒤 복수 초대장을 만들어 또 다른 친구에게 보내는 30초짜리 공유 게임.

**플레이:** https://shyeseon.github.io/boo/

- 서버 없음 — 모든 상태는 URL 파라미터 + 받는 쪽 기기의 localStorage
- 결과는 받는 쪽 브라우저에서 선택 시점에 `crypto.getRandomValues`로 확정 (보낸 사람 조작 불가)
- 이벤트 25종, 미션 2종(유령 잡기·50탭), 사탕 바구니·칭호, 복수 체인, Canvas 결과 카드 + QR

## 개발

빌드 없음(바닐라 JS ES 모듈). 로컬 실행:

```bash
python3 -m http.server 8777   # 또는 npx serve
```

`fetch`를 쓰므로 file:// 로는 열리지 않는다. 자세한 설계는 [BOO_구현명세.md](BOO_구현명세.md) 참고.

## 테스트

- roll 분포·조사 처리: 콘솔에서 `await booSimulate('treat', 100)` / `booSimulate('trick', 100)`
  (수용 기준: treat loss 35~55%, trick gain+mission 40~60%)
- E2E: 생성 → 공유 → 플레이 → 결과 → 재접속 동일 결과 → 복수 체인 → 깨진 링크 처리
