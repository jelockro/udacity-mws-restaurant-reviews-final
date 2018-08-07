// var idb = require('idb');
// var logIdbVersion = () => {console.log(idb.VERSION);}
// logIdbVersion();
// console.log("how does this work");

var cacheID = "mws-restaurant-stage-1";

//console.log(self.indexedDB);

if (!self.indexedDB) {
  console.log("Your browser doesn't support a stable version of IndexedDB.")
} else console.log("I see indexedDB");

// opening database
var db;
var request = self.indexedDB.open('mws_DB', 2);

request.onsuccess = event => {
  var restaurants = [
        {id: 1, name: 'Red Men T-Shirt', price: '$3.99'},
        {id: 2, name: 'Pink Women Shorts', price: '$5.99'},
        {id: 3, name: 'Nike white Shoes', price: '$300'}
    ];
  console.log('[onsuccess]', request.result);
  db = event.target.result; //<- = request.result, event.target is same as `request`
  // create transaction from database
  var transaction = db.transaction('restaurants', 'readwrite'); //<- transaction on the store restaurants
  // add success event handler for transaction
  transaction.onsucess = event => console.log('[Transaction] ALL DONE!');
  transaction.onabort = event => console.log('[abort]', event);
  transaction.onerror = event => console.log('[error]', event);
  // get store from transaction
  // returns IDBObjectStore instance
  var restaurantStore = transaction.objectStore('restaurants');
  // put restaurants data in restaurantStore
  restaurants.forEach(restaurant => {
    var db_op_req = restaurantStore.add(restaurant);// IDBRequest
    db_op_req.onsuccess = event => console.log(event.target.result == restaurant.id); //true
    db_op_req.onerror = event => console.log('[db_op_req]:', event);
    
    }); 
  
};

//error handler
request.onerror = event => {
  console.log('[onerror]', request.error);
};



request.onupgradeneeded = event => {
  var db = event.target.result;
  var store= db.createObjectStore("restaurants", {keyPath: "id"}); //<-- restaurants is storeName
  store.createIndex("name", "name", {unique: false});
  // objectStore.createIndex("neighborhood", "neighborhood", {unique: false});
  // objectStore.createIndex("photograph", "photograph", {unique: false});
  // objectStore.createIndex("address", "address", {unique: true});
  // objectStore.transaction.oncomplete = event => {
  //   var restaurantObjectStore = db.tranasaction("restaurants", "readwrite").objectStore("restaurants");
  //   restaurantData.forEach(restaurant => {
  //     restaurantObjectStore.add(restaurant);
  //   })
  // }
};




self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheID).then(cache => {
      return cache.addAll([
        "/index.html",
        "/restaurant.html",
        "/css/styles.css",
        //"/data/restaurants.json",
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
  let copyRequest = event.request.clone();
  let cacheUrlObj = new URL(event.request.url);
  let indexTest = event.request.url.indexOf("restaurant.html");
  if (event.request.url.indexOf("restaurant.html") > -1) {
    const cacheUrl = "restaurant.html";
    cacheRequest = new Request(cacheUrl);
  }
  const checkURL = new URL(copyRequest.url);
  
  //console.log(checkURL.port);
  if (checkURL.port === "1337") {
    const parts = checkURL.pathname.split('/');
    const id = parts[parts.length - 1] === "restaurants"
      ? "-1"
      : parts[parts.length -1];
    console.log("parts: ", parts);
    console.log("id: ", id);
    console.log("checkURL.port: ", checkURL.port);
  } else {
    console.log("not port 1337: ", checkURL.port);
  }
});

