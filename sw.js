// 서비스 워커: 정적 자원 캐시만 (선택 사항)
const CACHE = 'boo-v2';
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
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' })
      .then(hit => hit ?? fetch(e.request))
  );
});
