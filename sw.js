// 서비스 워커: 네트워크 우선, 오프라인 시 캐시 폴백.
// (캐시 우선이면 배포한 수정이 사용자에게 전달되지 않는 문제가 있어 전략 변경)
const CACHE = 'boo-v3';
const ASSETS = [
  '.',
  'index.html',
  'styles.css',
  'manifest.json',
  'data/events.json',
  'assets/icon.svg',
  'src/main.js',
  'src/util.js',
  'src/store.js',
  'src/audio.js',
  'src/art.js',
  'src/screens/home.js',
  'src/screens/create.js',
  'src/screens/play.js',
  'src/screens/result.js',
  'src/game/roll.js',
  'src/game/basket.js',
  'src/game/missions/ghostTap.js',
  'src/game/missions/tap50.js',
  'src/share/link.js',
  'src/share/kakao.js',
  'src/share/card.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' })
          .then(hit => hit ?? Response.error())
      )
  );
});
