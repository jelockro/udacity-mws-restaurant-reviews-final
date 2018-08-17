//const idb = require('idb');
console.log('is it this one?');
const cacheID = '5';
// ********************
// Open and Add Cached Resources to Cache
// ********************
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheID).then(cache => {
      return cache.addAll([
        '/index.html',
        '/restaurant.html',
        '/css/index.min.css',
        '/css/restaurant.min.css',
        '/js/main.js',
        '/js/restaurant_info.js',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
      ])
      .then(cached => console.log('cache successful,', cached))
      .catch(e => {
        console.log("Opening Caches Failed: " + e);
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== cacheID)
          return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  var tryCaches = caches.open(cacheID).then(cache => {
    return cache.match(event.request).then(response => {
      if (!response) {
        return handleNoCacheResponse(event);
      }
      fetchThenCache(event);
      return response;
    });
  });
  event.respondWith(tryCaches);
});

function fetchThenCache(event) {
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
   return fetch(event.request).then(res => {
    if (!res.url) return res;
     if (new URL(res.url).origin !== location.origin) return res;
 
     return caches.open(cacheID).then(cache => {
       cache.put(event.request, res.clone());
       return res;
     });
   }).catch(err => console.error(event.request.url, err));
 }

function handleNoCacheResponse(event) {
   return fetchThenCache(event);
 }
