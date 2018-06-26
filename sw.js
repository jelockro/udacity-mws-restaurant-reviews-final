var cacheID = "mws-restaurant-stage-1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheID).then(cache => {
      return cache.addAll([
        "/index.html",
        "/restaurant.html",
        "/css/styles.css",
        "/data/restaurants.json",
        "/js/dbhelper.js",
        "/js/main.js",
        "/js/restaurant_info.js",
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
  let cacheUrlObj = new URL(event.request.url);
  let indexTest = event.request.url.indexOf("restaurant.html");
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheUrl = "restaurant.html";
    cacheRequest = new Request(cacheUrl);
  }
  if (cacheUrlObj.hostname !== "localhost") {
    event.request.mode = "no-cors";
  }

  event.respondWith(
    caches.match(cacheRequest).then(response => {
      return (response || fetch(event.request)
        .then(fetchResponse => {
          return caches.open(cacheID).then(cache => {
            cache.put(event.request, fetchResponse.clone());
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
