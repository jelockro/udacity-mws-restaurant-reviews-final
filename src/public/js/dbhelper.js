//const idb = require('idb');
const dbName = 'mws_DB';
const version = 3; 
const storeName = 'restaurants';
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
   
  //  I'm creating a static function to open the indexedDB database
  static openDB() {
    return idb.open(dbName, version, upgradeDB => {
      //debugger;
      const store = upgradeDB.createObjectStore('restaurants', { keyPath: 'id' }); 
      store.createIndex('name', 'name', { unique: false }); 
      });
  }
  
  static getStore(storeName, mode, dbService) {
    return dbService.transaction(storeName, mode).objectStore(storeName);
  };


  static fetchRestaurants(callback) {
    //let restaurantsJson;
    //let restaurants;
    //debugger;
    const fetchURL = DBHelper.DATABASE_URL;
    
    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB.");
      fetch(fetchURL).then(response => response.json())
        .then(restaurants => {
        //console.log("restaurants JSON: ", restaurants);
        callback(null, restaurants);
        //debugger;
      }).catch(e => {
          callback(`Request failed. Returned ${e}`, null);
      });
    } 
    
    // **** PROMISE Section ************************************
    // now we will begin opening a database and preparing for either
    // populating it, or fetching from it.
    // ***************************************
  
    const helper = new Promise((resolve, reject) => DBHelper.openDB() //<- the function is a chain
      
      .then(db => { //we are going to open a transaction and an object store
      // if there is already a database we will .getall 
        //console.log('[openDB().then(db)] :', db); 
        
        if (db) {
          var transaction = db.transaction(storeName, 'readwrite');

          var restaurantStore = transaction.objectStore(storeName); //open the objet store

          return restaurantStore.getAll();
        }
        else {
        //  otherwise we will return an empty list to be populated
        //console.log('after if (db): does this part of code get touched?');
        return [];
       //console.log('[storeConnection:transaction.objectStore:] :', restaurantStore);
       // db is closed at this point. ******
        }
      })
      
      .then(async restaurants => { // 
        // at first go around we receive an empty list
        // 
          //debugger;
          //console.log('is this an array of restaurants? ->', restaurants);
          if (!restaurants || restaurants.length === 0) {
            // start populating the list with our async/await fetch code 
            //console.log('are we here yet');
            await fetch(fetchURL)
              .then(response => response.json())
                .then(async restaurantsjson => {
                  //console.log('[restaurantsjson.then]', restaurantsjson);
                  
                  const db = await DBHelper.openDB();
                  //console.log('storeName:', storeName);
                  const transaction = await db.transaction(storeName, 'readwrite');
                  restaurantsjson.forEach(restaurant => {
                      //console.log('[restaurant] :', restaurant);
                      transaction.objectStore(storeName)
                      .put(restaurant);
                      //console.log('[after put]: Success!');
                    }
                  );
                  //console.log('[async restaurants]:restaurantsjson', restaurantsjson);
                  resolve(restaurantsjson);
                });            
          }
          else resolve(restaurants);          
          //resolve(restaurants);        
      }));  // this ends the async restaurants functional code which returned restaurants 
        
   helper.then(restaurants => {
          //console.log('[resolve statement]: restaurants', restaurants);
          callback(null, restaurants);      
        }, error => {
          //console.log('[for reals, theres errs?]: error:', error);
        });    
    // **** End Promise Section *****
    // **************************************
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    //debugger;
    DBHelper.fetchRestaurants((error, restaurants) => {
      //debugger;
      if (error) {
        //debugger;
        callback(error, null);
      } else {
        // console.log('[fecthbyid]:id:', id);
        // let idtype = typeof(id);
        // console.log('[fetchbyid]:argumentidtype:', idtype);
        // console.log('[fetchbyid]:restaurants:', restaurants);
        // restaurants.forEach(r => {
        //   console.log('ids', r.id);
        //   let idtype = typeof(id);
        //   console.log('[fetchbyid]:indb:idtype:', idtype);
        // });
        const restaurant = restaurants.find(r => r.id === parseInt(id, 10));
        //debugger;
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    //debugger;
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type === cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    //debugger;
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood === neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    //debugger;
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine !== 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type === cuisine);
        }
        if (neighborhood !== 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood === neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    //debugger;
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant, type) {
    return (`/img/${type}/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

  static async toggleRestaurantFavorite(id, isFavorite) {
    // I want to see what the state is in the database at this point
    this.openDB().then(db => {
      const tx = db.transaction(storeName, 'readwrite').objectStore(storeName);
      tx.get(id).then(request => {
        console.log('in the database, here is the state before switcharoo,', request);
      }).catch(e => console.log('damn,',e));
    });

    let restaurant;
    isFavorite = (isFavorite === 'true' || isFavorite === true ? false : true); 
    console.log('after switcharoo: ', isFavorite);   // Toggling state so reversing the value
    try {
        const fetchURL = DBHelper.DATABASE_URL;
        restaurant = await fetch(`${fetchURL}/${id}`, { method: 'PUT', body: `is_favorite=${ isFavorite }`});
        console.log('what might the state of restaurant be?', restaurant)
        if (!restaurant) {
          console.log('! restaurant is proving false');
          return; // CORS Prefetch OPTIONS skip
        }
    } catch (error) {
      console.log(error, "'PUT' request did not work.");
    }
    // so far the 'PUT' request is successful, we also need to update the database

    this.openDB().then(db => {
      const tx = db.transaction(storeName, 'readwrite').objectStore(storeName);
      tx.get(id).then(request => {
        console.log('your request is,', request);
        var restaurant = request;
        restaurant.is_favorite = isFavorite;
        var requestUpdate = tx.put(restaurant);

        }).catch(e => console.log('damn,',e));
      // request.onsuccess =  event => {
      //   var restaurant = event.target.result;
      //   restaurant.is_favorite = isFavorite;
      //   var requestUpdate = tx.put(restaurant)
      // }
  });


    // const dbService = await this.openDB();
    // console.log('dbService:', dbService);
    // const store = await this.getStore(storeName, 'readwrite', dbService);
    // if (!restaurant) {
    //     console.log('There\'s no restaurant!');
    //     restaurant = await store.get(id);
    //     //restaurant.synced = 0;
    //     restaurant.is_favorite = isFavorite;
    // }
    // console.log('okay, your restaurant is ', restaurant, ' and check this out: ', restaurant.is_favorite);
    // store.put(restaurant);
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */
 
  /**
   * Fetch all restaurants.
   */
 /**   
  *  Old XHR *
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }
*/

// //console.log(self.indexedDB);
// // i think this code is only run once when the service worker is activated
// // so I think that if I want service worker code to be run it needs to be done inside an eventlistener


// if (!self.indexedDB) {
//   console.log('Your browser doesn\'t support a stable version of IndexedDB.');
// } else console.log('I see indexedDB');



// openDB();

// opening database on activate sequence
// self.addEventListener('activate', event => {
//   event.waitUntil(
//     db = openDB()
//     );
// });

}
