//const idb = require('idb');
const dbName = 'mws_DB';
const version = 3; 
const RESTAURANT_STORE = 'restaurants'; //for store name
const REVIEWS_STORE = 'reviews'; // for store name'
let restaurantArray = [];
let reviewsArray = [];

//const port = '1337';
function GET_URL(port, filepath, id) { 
    if (!id) { 
      console.trace('!id port, fileapth, id,', port, filepath, id)
      return `http://localhost:${port}/${filepath}`;
    }
    else {
      console.log('port, fileapth, id,', port, filepath, id);
      return `http://localhost:${port}/${filepath}/${id}`;
    } 
}
/**
 * server object
 * 
 */
var Server = {
  // NETWORK SERVICES, make a constant for Network Service urls
  

  PORT: '1337', // Change this to your server port
  id: null,


  /** a static method that gets data from the server url. This will be called in !window.navigator or when online
  * @param {*} network service objects, id of data object requested
  * written as a promise.
  */
  requestData : (networkService) => {
    return new Promise((resolve, reject) =>{
      console.log('[requestdata]:networkService:', networkService);

      fetch(GET_URL(networkService[0], networkService[1]))
        .then(response => response.json())
          .then(jsonData => {
            console.log('[fetcjdata]:jsonData:',jsonData);
            resolve(jsonData);
          })
           .catch(e => reject(`Request failed. Returned ${e}`, null));
    });
  },


}

var server = Object.create(Server);
const  RESTAURANTS_URL =[server.PORT, 'restaurants'];
const  RESTAURANT_BY_ID = [server.PORT, 'restaurants', server.id];
const  REVIEWS_URL= [server.PORT, 'reviews'];
const  REVIEWS_BY_ID= [server.PORT, 'reviews', server.id];


function findById(jsonArray, id, callback) {
  const result = jsonArray.find(r => r.id === parseInt(id, 10));
  //debugger;
  if (result) return(null, result);
  else return('data does not exist', null);
}

class DBHelper {


  //  static function to open the indexedDB database
  static openDB() {
    return idb.open(dbName, version, upgradeDB => {
      //debugger;
      const restaurantStore = upgradeDB.createObjectStore(RESTAURANT_STORE, { keyPath: 'id' }); 
      restaurantStore.createIndex('name', 'name', { unique: false }); 

      const reviewStore = upgradeDB.createObjectStore(REVIEWS_STORE, { keyPath: 'id' }); 
      reviewStore.createIndex('restaurant_id', 'restaurant_id', { unique: false }); 
      });
  }

  // a static method that will get open the store connection and return it.  Is possibly promise.  
  static getStore(storeName, mode, dbService) {
    const tx = dbService.transaction(storeName, mode);
    return tx;
  }

  static gettingAll(storeName) {
    return DBHelper.openDB().then(db => {
      return db.transaction(storeName)
        .objectStore(storeName).getAll();
    });
  }

  static addToIDB(obj, storeName) {
    return new Promise((resolve,reject) => {
      DBHelper.openDB().then(db => {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(obj);
        resolve(tx.complete);
      });
    });
  }
  
  // a static method that opens db, get's store 
  // and puts data from network service paramaters into db
  // @param {*} networkService
  static serverToIDB(networkService, storeName) { 
    return new Promise(async(resolve, reject) => {
      //debugger;
      let serverData = await server.requestData(networkService);
      serverData.forEach(resource => {
        console.log('resouce form server,', resource);
        DBHelper.addToIDB(resource, storeName)
          .then(message => {
            console.log('Done,', message);
          });
      });
      resolve('Resources were successfully put in IDB'); 
    })  
      .catch(e => console.log('it didn\'t work ', e));
  }  
  
  /**
  *This should return an object, individual restaurant or review, or all restaurants and reviews.
  *
  */
  static dataFromIDB(storeName, dbService, id) {
    return new Promise((resolve,reject) => {
      if (!id) resolve(DBHelper.gettingAll(storeName));
      else resolve(getStore(storeName, 'readwrite', dbService).index(id));
    });
  }
  
  static async fetchReviews(callback) {
    if (!window.indexedDB) callback(null, server.requestData(REVIEWS_URL));
    debugger;
    let reviewsArray = [];
    let db = await DBHelper.openDB();
    debugger;
    reviewsArray = await DBHelper.gettingAll(REVIEWS_STORE);
    console.log('[reviewsArray] ,', reviewsArray);
    debugger;
    if (reviewsArray.length === 0) {
      debugger;
      DBHelper.serverToIDB(REVIEWS_URL, REVIEWS_STORE, db)
        .then(result => {
          debugger;
          console.log(result);
          DBHelper.dataFromIDB(REVIEWS_STORE, db).then(data => callback(null, data));
        });
    }
    callback(null, reviewsArray);

  }

  static async fetchRestaurants(callback) {
    if (!window.indexedDB) callback(null, server.requestData(RESTAURANTS_URL));
    debugger;
    if (restaurantArray.length === 0) {
      let db = await DBHelper.openDB();
      DBHelper.serverToIDB(RESTAURANTS_URL, RESTAURANT_STORE, db)
        .then(result => {
          debugger;
          console.log(result);
          DBHelper.dataFromIDB(RESTAURANT_STORE, db).then(data => callback(null, data));
        });
    }
    else DBHelper.dataFromIDB(RESTAURANT_STORE, db).then(data => callback(null, data));

  }
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    if (!window.indexedDB) {
      server.id = id;
      callback(null, server.requestData(RESTAURANT_BY_ID));
    }
    else DBHelper.fetchRestaurants((error, restaurants) => {
      callback(null, findById(restaurants, id));
    });   
  }
  /**
  * Fetch reviews by ID.
  */
  static fetchReviewsById(id, callback) {
    if (!window.indexedDB) {
      server.id = id;
      callback(null, server.requestData(REVIEWS_BY_ID));
    }
    else DBHelper.fetchReviews((error, reviews) => {
      if (error) callback(error, null);
      const results = reviews.filter(r => r.restaurant_id === parseInt(id, 10));
      console.trace('[fetchReviewsById]: results', results);
      callback (null, results);
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
    debugger;
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
  
  //  creating a new method that is written in promise synt
  static toggle(id, isFavorite) {
    return new Promise ((resolve, reject) => {
      
      let p1 = new Promise((resolve, reject) => {
      //Switcharoo code, if the state is true, make it false, vice versa
        let restaurant;
        console.log('server.RESTAURANTS_URL', RESTAURANTS_URL);
        const fetchURL = GET_URL(server.PORT, 'restaurants');
        isFavorite = (isFavorite === 'true' || isFavorite === true ? false : true); 
        console.log('after switcharoo: ', isFavorite); 
        console.log('server.port.' , typeof server.port, server.port);
        console.log('server.id', server.id);
        console.log('server.RESTAURANTS_URL,',RESTAURANTS_URL);
        console.log('[fetchURL],', fetchURL);

        
        // a fetch promise, with catch statement
        fetch(`${fetchURL}/${id}/?is_favorite=${isFavorite}`, { 
            method: 'PUT'})
          .then(response => {
            let jsonevent = response.json();
            console.log('jsonevent,', jsonevent);
            console.log('check_status: ', jsonevent);
             // this resolves the p1 promise so it can be thenned below
             // this should be restaurant json
            resolve(jsonevent);
          })
          .catch(err => console.log('did not get a response from put request:', err));
      });

      p1.then(async restaurantjson => {

        console.log('[restaurantsjson.then]', restaurantjson, 
        '\n [restaurantjson.is_favorite]:', restaurantjson.is_favorite);

        const db = await DBHelper.openDB();
        console.log('storeName:', RESTAURANT_STORE);
        const tx = await db.transaction(RESTAURANT_STORE, 'readwrite').objectStore(RESTAURANT_STORE);
        tx.get(id)
          .then(async request => {
            console.log('pulled this record from idb,', request);
            console.log('I will update this record with,', restaurantjson);
            //let restaurant = request;
            //restaurant.is_favorite = isFavorite;
            console.log('restaurant.is_favorite into idb,', restaurantjson.is_favorite);
            const requestUpdate = await tx.put(restaurantjson);
            const newObject = await tx.get(id);
            console.log('newObject', newObject);
            resolve(newObject); //resolves the top-level promise
          })
          .catch(e => console.log('damn,', e));
      });
      //console.log('[async restaurants]:restaurantsjson', restaurantsjson);
      //resolve(restaurantsjson);
    });  
  }
  static async getCachedReviews(id) {
      const dbService = await this.openDB();
      debugger;
      const tx = this.getStore(REVIEWS_STORE, 'readwrite', dbService);
      const store = tx.objectStore(REVIEWS_STORE);
      console.log('store in getCachedReviews:', store);
      return store.index('restaurant_id').getAll(id);
  }
  static async addReview(review) {
      const errors = [];
   
      if (!review.restaurant_id) {
          errors.push('restaurant_id');
      }

      if (!review.name) {
          errors.push('name');
      }

      if (!review.rating) {
          errors.push('rating');
      }

      if (!review.comments) {
          errors.push('comments');
      }        

      if (errors.length === 0) {
          let result, success = true;
          try {
              transformForFetch(review, new Date());
              result = await request(`${ENDPOINT}/reviews`, 'POST', POST_HEADERS, review);
              if (result) {
                  // Check for result null which is returned by PreFlight OPTIONS call due to cross domain access
                  transformForClient(result);
                  result.synced = 1;
              }
          } catch (error) {
              // when request throws an error that means fetch failed and result will be null
              // so we save the existing review
              result = review;
              success = false;
          }

          const dbService = await openDB();
          const store = getStore(REVIEWS_STORE, 'readwrite', dbService);       
          if(!success) {
              const id = await store.count();
              transformForClient(result);
              result.synced = 0;
              result.id = id * -1;
              errors.push('fetch');
          }
          
          store.put(result);
      }

      return errors;
  }
}

