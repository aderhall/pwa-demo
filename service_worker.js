const staticCacheName = "PWADemo-Production";
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/index.js",
  "/icon.png",
  "/manifest.json"
];
let port;
function postMessage(message) {
  if (port) {
    port.postMessage(message);
  } else {
    setTimeout(() => {
      postMessage(message);
    }, 1);
  }
}

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticCacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  // event.respondWith intercepts the requests and prevents browser default behavior
  fetchEvent.respondWith(
    // Open the site-specific cache
    caches.open(staticCacheName).then(cache => {
      // First, try to get the resource from the network
      return fetch(fetchEvent.request)
        .then(res => {
          //postMessage({payload: fetchEvent.request.url})
          if (fetchEvent.request.method === "GET") {
            // If the fetch was successful, cache the newly-fetched resource (it may be a more recent version than the last one)
            cache.put(fetchEvent.request, res.clone());
          }
          return res;
        })
        .catch(err => {
          //postMessage({payload: [err, fetchEvent.request.url]});
          
          return cache.match(fetchEvent.request);
        });
    })
  );
});

self.addEventListener("message", messageEvent => {
  if (messageEvent.data && messageEvent.data.type == "INIT_PORT") {
    port = messageEvent.ports[0];
  }
})
