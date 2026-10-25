// 카카오톡 공유 (Kakao JS SDK v2 — index.html에서 CDN 로드)
//
// ⚠ 사용하려면 카카오 JavaScript 키가 필요하다:
//   1. https://developers.kakao.com → 내 애플리케이션 → 애플리케이션 추가
//   2. 앱 설정 > 플랫폼 > Web 에 사이트 도메인 등록: https://shyeseon.github.io
//   3. 앱 설정 > 앱 키 > JavaScript 키를 아래에 붙여넣기
const KAKAO_JS_KEY = 'ad2d0fe6ad0decdf586e7a621364e2d6';

const OG_IMAGE = 'https://shyeseon.github.io/boo/assets/og.png';

export function kakaoReady() {
  if (!KAKAO_JS_KEY || typeof Kakao === 'undefined') return false;
  if (!Kakao.isInitialized()) {
    try { Kakao.init(KAKAO_JS_KEY); } catch { return false; }
  }
  return Kakao.isInitialized();
}

// 성공 시 true, SDK 미설정·실패 시 false (호출 쪽에서 기본 공유로 폴백)
export function shareKakao({ url, from }) {
  if (!kakaoReady()) return false;
  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '저주받은 할로윈 초대장이 도착했다',
        description: `${from}님이 보낸 초대장. Trick? Treat? 문을 열기 전엔 아무도 모른다.`,
        imageUrl: OG_IMAGE,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: '문 열어보기', link: { mobileWebUrl: url, webUrl: url } },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
