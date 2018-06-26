var cacheID = "mws-restaurant-stage-1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheID).then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/restaurant.html",
        "/css/styles.css",
        "/data/restaurant.json",
        "/js/",
        "/js/dbhelper.js",
        "/js/main.js",
        "/js/restuarant_info.js",
        "/img/"
        "/js/register.js"
      ])
      .catch(e => {
        console.log("Opening Caches Failed: " + e);
      });
    })
  );
});

self.addEventListener("fetch", event => {
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.requet.url);
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cancheUrl = "restaurant.html";
    cacheReqeust = new Reqeust(cacheUrl);
  }
  if (cacheUrlObj.hostname !== "localhost") {
    event.request.mode = "no-cors";
  }

  event.respondWith(
    caches.match(cacheReqeust).then(response => {
      return (response || fetch(event.request)
        .then(fetchResponse => {
          return caches.open(cacheID).then(cache => {
            cache.put(event.request.fetchResponse.clone());
            return fetchResponse;
          });
        })
        .catch(e => {
          return new Response("You are not connected to the internet", {
            status: 404,
            statusText: "Application is not connected to the internet."
          });
        })

      );
    })
  );
});
