//import idb from 'idb';
// var logIdbVersion = () => {console.log(idb.VERSION);}
// logIdbVersion();

console.log("how does this work");
//var db;
var cacheID = "mws-restaurant-stage-1";

//console.log(self.indexedDB);
// i think this code is only run once when the service worker is activated
// so I think that if I want service worker code to be run it needs to be done inside an eventlistener

if (!self.indexedDB) {
  console.log("Your browser doesn't support a stable version of IndexedDB.")
} else console.log("I see indexedDB");

function openDB(callback) {
  var request = self.indexedDB.open('mws_DB', 1);
  var db;
  // success handler
  request.onsuccess = event => {
    
    //console.log('[onsuccess: event.target.result]', event.target.result);
    //console.log('[onsuccess: event]', event);
    //return event.target.result;
    callback(event.target.result);
  };

  // error handler
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
  console.log('[openDB: before return] :', db);
  return db;

}


// opening database on activate sequence
// self.addEventListener('activate', event => {
//   event.waitUntil(
//     db = openDB()
//     );
// });


// ********************
// Open and Add Cached Resources to Cache
// ********************


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

// ****************
// on Service Worker activation, open IndexedDB and add restaurants from json
// debugging through using in fetch statements to get more feedback
// ****************


self.addEventListener("fetch", event => {
  function DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
    //  create a functionto store the db and run transactions on it
  function storeConnection(dbObj) {
    db = dbObj;
    //  console.log('[storeConnection: db variable] :', db); <- debug to see if stores the db properly
    
    //  create transaction & transaction handlers
    var transaction = db.transaction('restaurants', 'readwrite');
    transaction.onsucess = event => console.log('[Transaction] ALL DONE!');
    transaction.onabort = event => console.log('[abort]', event);
    transaction.onerror = event => console.log('[error]', event);
    
    //  get store from transaction
    //  returns IDBObjectStore instance
    var restaurantStore = transaction.objectStore('restaurants');
    console.log('[storeConnection:transaction.objectStore:] :', restaurantStore);
    fetchRestaurants(printer);
   };

    //  fetch data from server and turn it into json
  function fetchRestaurants(callback) {
    let fetchURL;
    fetchURL = DATABASE_URL();
    console.log('[fetchRestaurants] fetchURL:', fetchURL);
    fetch(fetchURL).then(response => response.json())
      .then(restaurants => {
        console.log("restaurants JSON: ", restaurants);
        callback(null, restaurants);
        //debugger;
      }).catch(e => {
          callback(`[fetchRestaurants] Request failed. Returned ${e}`, null);
      });
  }; 

  
  openDB(storeConnection);
});






//*****************
//  This area is basically a sandbox
//  for me to figure out how to implement indexedDB during
//  the sw's handling of fetch events.
//*****************




function printer(statement) {
    console.log("[fetch printer] :", statement);
    return statement
};



//self.addEventListener("fetch", event => {
  //clone request
  //let copyRequest = event.request.clone();
  
  //  can I see the db object after calling my open function 
  //openDB(printer);
  //  printer is printing the db object like I want


//});
  




  //console.log("copyRequest looks like: ", copyRequest);
  
  // check url of request because right now 
  // we only want to work on requests to localhost.port 1337


// ****************
// I am going to put this code below on hold until I get confident
// in using indexedDB. 
// ***************


  // const checkURL = new URL(copyRequest.url);
  // //console.log(checkURL);
  // if (checkURL.port === "1337") {
  //   const parts = checkURL.pathname.split('/');
  //   const id = parts[parts.length - 1] === "restaurants"
  //     ? "-1"
  //     : parts[parts.length -1];
  //   console.log("Yay, a port 1337, parts: ", parts);
  //   console.log("id: ", id);
  //   console.log("checkURL.port: ", checkURL.port);

  //   fetch(copyRequest).then(response => response.json())
  //     .then(restaurants => {
  //       var db;
  //       console.log("restaurants JSON: ", restaurants);
  //       // At this poine we have an array of length 10.  
  //       // now iterate through the list and add to indexedDB
  //       console.log('db check: ', db);
  //       if (db === undefined ) {
  //         openDB().then(response => console.log('[fetchdb] after running openDB method: ', response)).catch(e=> (console.log(e)));
  //       }
  //       // run console statement to see if database is null
  //       console.log('after db check, db is:', db);
  //       // run console statement to see if the transaction is open
  //       console.log('db transaction is:', transaction);
  //       // transaction does not exist so let's create one.
  //       v //<- transaction on the store restaurants
  //       console.log('db transaction is:', transaction);
  //       // add success event handler for transaction
  //       transaction.onsucess = event => console.log('[Transaction] ALL DONE!');
  //       transaction.onabort = event => console.log('[abort]', event);
  //       transaction.onerror = event => console.log('[error]', event);
        
  //       // get store from transaction
  //       // returns IDBObjectStore instance
  //       var restaurantStore = transaction.objectStore('restaurants');
  //       // put restaurants data in restaurantStore
  //       restaurants.forEach(restaurant => {
  //         var db_op_req = restaurantStore.add(restaurant);// IDBRequest
  //         db_op_req.onsuccess = event => console.log(event.target.result == restaurant.id); //true
  //         db_op_req.onerror = event => console.log('[db_op_req]:', event);
          
  //       }); 

       
  //     }).catch(e => {
  //         console.log(`Request failed. Returned ${e}`, null);
  //     });
  
  // };
//
  //let copyRequestJson =  copyRequest.json();
 
  //console.log("copyRequestJson looks like: ", copyRequestJson);
  //then(response => response.json())
  //     .then(restaurants => {
  // let cacheUrlObj = new URL(event.request.url);
  // let indexTest = event.request.url.indexOf("restaurant.html");
  // if (event.request.url.indexOf("restaurant.html") > -1) {
  //   const cacheUrl = "restaurant.html";
  //   cacheRequest = new Request(cacheUrl);
  // }

  // }




//    else {
//     //console.log("not port 1337: ", checkURL.port);
//   }
// });

