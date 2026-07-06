// Минимальный service worker для установки PWA и упаковки в Google Play (TWA).
// Стратегия: network-first, без агрессивного кэширования — данные лояльности
// (баллы, штампы, история) всегда должны быть свежими. Наличие обработчика
// fetch нужно, чтобы браузер считал сайт устанавливаемым приложением.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // Запросы идут в сеть как обычно (браузер обрабатывает их сам).
})
