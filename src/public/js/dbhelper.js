//const idb = require('idb');
const dbName = 'mws_DB';
const version = 2; 
const DOMAIN = 'http://localhost:1337';
const RESTAURANT_STORE = 'restaurants'; //for store name
const REVIEWS_STORE = 'reviews'; // for store name'

const POST_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const openDB = async() => {
  const db =  await idb.open(dbName, version, upgradeDB => {
        const restaurantStore = upgradeDB.createObjectStore(RESTAURANT_STORE, { keyPath: 'id' });
        const reviewsStore = upgradeDB.createObjectStore(REVIEWS_STORE, { keyPath: 'id' });
        restaurantStore.createIndex('name', 'name', { unique: false }); 
        restaurantStore.createIndex('synced', 'synced', { unique: false }); 
        reviewsStore.createIndex('restaurants', 'restaurant_id', { unique: false }); 
        reviewsStore.createIndex('synced', 'synced', { unique: false }); 
        console.log('stores & indexes created');
    
  });
  return db;
};

const GET_URL = (port, filepath, id) => { 
    let getUrl;
    if (!id) { 
      getUrl = `http://localhost:${port}/${filepath}`;
    } 
    else {
      getUrl = `http://localhost:${port}/${filepath}/${id}`;
    } 
    return getUrl;
};

const request = async (url, method = 'GET', headers = {}, body = null) => {
    const options = {
        method
    };
    if (headers) options.headers = headers;
    if (body) options.body = JSON.stringify(body);
    //console.log('url, options.headers, options.body:', url, options.headers, options.body);
    const response = await fetch(url, options);
    //console.trace('request:response', response);
    if (options && options.method) {
        
        return await response.json();
    }
    return response;
};

const findById = (jsonArray, id, callback) => {
  const result = jsonArray.find(r => r.id === parseInt(id, 10));
  //debugger;
  if (result) callback(null, result);
  else callback('data does not exist', null);
};

const transformForClient = (review) => {
    if (review.createdAt) review.createdAt = new Date(review.createdAt);
    if (review.updatedAt) review.updatedAt = new Date(review.updatedAt);
};

const transformForFetch = (review) => {
    delete review.synced;
    delete review.id;
};

const REVIEWSDOMAIN = (id) => {
  const url = `${DOMAIN}/reviews/?restaurant_id=${id}`;
  return url;
};
/**
 * server object
 * 
 */
const Server = {
  // NETWORK SERVICES, make a constant for Network Service urls
  PORT: '1337', // Change this to your server port
  id: null,

  /** a static method that gets data from the server url. 
  * This will be called in !window.navigator or when online
  * @param {*} network service objects, id of data object requested
  * written as a promise.
  */
  //using method shorthand
  requestData(networkService) {
    return new Promise((resolve, reject) => {
      //console.log('[requestdata]:networkService:', networkService);

      fetch(GET_URL(networkService[0], networkService[1]))
        .then(response => response.json())
          .then(jsonData => {
            //console.log('[fetcjdata]:jsonData:',jsonData);
            resolve(jsonData);
          })
           .catch(e => reject(`Request failed. Returned ${e}`, null));
    });
  }
};
// Network Services
const server = Object.create(Server);
const RESTAURANTS_URL = [server.PORT, 'restaurants'];
const RESTAURANT_BY_ID = [server.PORT, 'restaurants', server.id];
const REVIEWS_URL = [server.PORT, 'reviews'];
const REVIEWS_BY_ID = [server.PORT, 'reviews/?restaurant_id=<restaurant_id>', server.id];

const RESTAURANTSDOMAIN = `${DOMAIN}/restaurants`;

class DBHelper {
  // a static method that will get open the store connection and return it.  Is possibly promise.  
  static getStore(storeName, dbService) {
    //console.log('getStore dbService', dbService);
    //debugger;
    return dbService.transaction(storeName, 'readwrite').objectStore(storeName);
  }

  static async gettingAll(storeName) {
    let restaurants;
    //debugger;
    const db = await openDB();
    //console.trace('db', db);
    restaurants = db.transaction(storeName).objectStore(storeName).getAll();
    return restaurants;
  }

  static addToIDB(obj, storeName, dbService) {
    return new Promise(async(resolve, reject) => {
        const store = await DBHelper.getStore(storeName, dbService);
        if (store === undefined) {
          reject('getStore did not work');
          return;
        }
        store.put(obj);//.then(console.log('yay'));
        resolve(obj);
    });
  }
  
  /** a static method that tries network first,
  * then opens db, get's store 
  * and transforms data from network service paramaters 
  * before putting into Idb
  * @param {*} networkService
  */
  static serverToIDB(networkService, storeName, transform = null, dbService = null) { 
    return new Promise(async(resolve, reject) => {
      let Data;
      let Message;
      try {
        Data = await request(networkService);
        //console.log('Data', Data);
        if (!dbService) {
          dbService = await openDB();
        }
        const store = await DBHelper.getStore(storeName, dbService);
        //debugger;
        Data = Data.map(resource => {
          //console.log('resouce form server,', resource);
          if (transform) {
            transform(resource);
          }
          //console.log('storeName', storeName );
          //debugger;
          resource.synced = 1;

          //debugger;
          store.put(resource);
          //debugger;
          return resource;

  
          //return Message;
        });
        //console.trace('DATa,', Data);
      }
      catch (error) {
        //console.trace('[serverToIdb Error]', error);
        //debugger;
        Data = await DBHelper.gettingAll(storeName);
      }
      resolve(Data); 
    });
  }  

  /**
  *This should return an object, individual restaurant or review, or all restaurants and reviews.
  *
  */
  static dataFromIDB(storeName, dbService, id) {
    return new Promise((resolve, reject) => {
      if (!id) resolve(DBHelper.gettingAll(storeName));
      else resolve(DBHelper.getStore(storeName, 'readwrite', dbService).index(id));
    });
  }
  
  static async fetchReviews(callback) {
    let reviews;
    // if not online capable
    if (!window.indexedDB) {
      reviews = server.requestData(REVIEWS_URL);
    }
    // utilizies serverToIDB to ensure syncing is up to date
    const db = await openDB();
    reviews = await DBHelper.serverToIDB(REVIEWS_BY_ID, REVIEWS_STORE, null, db)
      .then(reviewsArray => {
        return reviewsArray;
      });
    callback(null, reviews);
  }

  static async fetchRestaurants(callback) {
    // if not offline capable
    let restaurants;
    if (!window.indexedDB) {
      restaurants = await server.requestData(RESTAURANTS_URL);
    }
    // utilizies serverToIDB to ensure syncing is up to date
    const db = await openDB();
    restaurants = await DBHelper.serverToIDB(RESTAURANTSDOMAIN, RESTAURANT_STORE, null, db)
      .then(restaurantsarray => {
        //console.log('restaurantsarray', restaurantsarray);
        restaurants = restaurantsarray;
        return restaurants;
      });
    //console.trace('restuarants,', restaurants);
    callback(null, restaurants);
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
      findById(restaurants, id, (error, restaurant) => {
        if (error) callback(error, null);
        else callback(null, restaurant);
      });
    });   
  }
  /**
  * Fetch reviews by ID.
  */
  static async fetchReviewsById(id, callback) {
    server.id = id;
    let reviewsbyid;
    if (!window.indexedDB) {
      reviewsbyid = await request(`${DOMAIN}/reviews/?restaurant_id=${id}`);
      callback(null, reviewsbyid);
    }
    else {
      const db = await openDB();
      reviewsbyid = await DBHelper.serverToIDB(REVIEWSDOMAIN(id), REVIEWS_STORE, null, db)
        .then(reviewsArray => {
          return reviewsArray;
        });
      callback(null, reviewsbyid);
    }
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
    return new Promise((resolve, reject) => {
      let restaurantdata;
      const p1 = new Promise((resolve, reject) => {
      //Switcharoo code, if the state is true, make it false, vice versa
       // console.log('server.RESTAURANTS_URL', RESTAURANTS_URL);
        const fetchURL = GET_URL(server.PORT, 'restaurants');
        isFavorite = (isFavorite === 'true' || isFavorite === true ? false : true); 
        fetch(`${fetchURL}/${id}/?is_favorite=${isFavorite}`, { method: 'PUT' })
        .then(async response => {
              restaurantdata = await response.json();
              //if (!restaurant) return;
              //console.log('p1:response', response);
              //debugger;
              //console.log('p1:restaurant', restaurantdata);
              resolve(restaurantdata);
        })
        .catch(error => {
          //console.log('unable to access server, storing data');
          resolve(restaurantdata);
        });
      });

      p1.then(async restaurantjson => {
        const db = await openDB();
        const store = DBHelper.getStore(RESTAURANT_STORE, db);
        if (!restaurantjson) {
           //debugger;
          //console.log('restaurantjson, db, store', restaurantjson, db, store);
          restaurantdata = await store.get(id);
          //console.log('restaurantdata after store.get(id)', restaurantdata);
          //debugger;

          restaurantdata.synced = 0;
          restaurantdata.is_favorite = isFavorite;
        }
        else {
          //debugger;
          //console.log('restaurantjson, db, store', restaurantjson, db, store);
          restaurantdata = restaurantjson;
        }     
        //console.log('restaurantdata before put', restaurantdata);
        store.put(restaurantdata);
        resolve(restaurantdata); 
      });

      
        //console.log('[restaurantsjson.then]', restaurantjson, 
        //'\n [restaurantjson.is_favorite]:', restaurantjson.is_favorite);

        
        //console.log('storeName:', RESTAURANT_STORE);
    });
      //console.log('[async restaurants]:restaurantsjson', restaurantsjson);
      //resolve(restaurantsjson);
  }  
  

  static async getCachedReviews(id) {
      const dbService = await openDB();
      //debugger;
      const store = await DBHelper.getStore(REVIEWS_STORE, dbService);
      console.log('store in getCachedReviews:', store);
      return store.index('restaurants').getAll(id);
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
              //console.log('fetchurl', fetchurl);
              //console.trace('addReview fetchurl, review:', fetchurl, review);
              result = await request(`${DOMAIN}/reviews/`, 'POST', POST_HEADERS, review);;
              //debugger;
              if (result) {
                  // Check for result null which is returned by PreFlight OPTIONS call due to cross domain access
                  //debugger;
                  transformForClient(result);
                  result.synced = 1;
              }
          } catch (error) {
              // when request throws an error that means fetch failed and result will be null
              // so we save the existing review
              //console.trace('fetch error:', error);
              result = review;
              success = false;
          }

          const dbService = await openDB();
          const store = await DBHelper.getStore(REVIEWS_STORE, dbService);       
          if (!success) {
              //debugger;
              const id = await store.count();
              transformForClient(result);
              result.synced = 0;
              result.id = id * -1;
              errors.push('fetch');
              //console.log('errors', errors);
          }
          //console.log('store, result', store, result);
          //debugger;
          store.put(result);
      }

      return errors;
  }
  static async sync() {
    let storeRestaurants, tx, storeReviews, unsyncedRestaurants, unsyncedReviews, isFavorite;
    const syncedReviews = [];
    const syncedRestaurants = [];
    const dbService = await openDB();
    try {
        storeRestaurants = await DBHelper.getStore(RESTAURANT_STORE, dbService).index('synced');    
        unsyncedRestaurants = await storeRestaurants.getAll(0);
        //console.log('storeRestaurants & unsyncedRestaurants', storeRestaurants, unsyncedRestaurants);

        if (unsyncedRestaurants.length !== 0) {
          for (const restaurant of unsyncedRestaurants) {
              isFavorite = (restaurant.is_favorite === 'true' || restaurant.is_favorite === true ? true : false);    // Handle API saving the values as strings after update
              restaurant = await request(`${DOMAIN}/restaurants/${restaurant.id}/?is_favorite=${isFavorite}`, 'PUT');
              if (restaurant) {
                  // Check for result null which is returned by PreFlight OPTIONS call due to cross domain access
                  restaurant.synced = 1;
                  syncedRestaurants.push(restaurant);
                  //console.log('syncedRestaurants after push', syncedRestaurants);
              }
          }
        } 
        else {
          let unsyncedId, result;
          storeReviews = await DBHelper.getStore(REVIEWS_STORE, dbService).index('synced');
          //console.log('syncedReviews', syncedReviews);
          unsyncedReviews = await storeReviews.getAll(0);
          //console.log('syncedReviews & unsyncedReviews:', syncedReviews, unsyncedReviews);
          if (unsyncedReviews.length !== 0) {
            //debugger;
            for (const review of unsyncedReviews) {
                // cannot use foreach since that will not allow async/await
                //console.log('review,', review);
                //debugger;
                unsyncedId = review.id;
                transformForFetch(review);
                //console.log('transformed for fetch,', review);
                //debugger;
                result = await request(`${DOMAIN}/reviews/`, 'POST', POST_HEADERS, review);
                //console.log('unsyced review request result', result);
                if (result) {
                    // Check for result null which is returned by PreFlight OPTIONS call due to cross domain access
                    transformForClient(result);
                    result.synced = 1;
                    result.unsyncedId = unsyncedId;
                    //console.log('transformed result', result);
                    //debugger;
                    //console.log('syncedReviews', syncedReviews);
                    syncedReviews.push(result);  
                }
            }
          }
        }
    } catch(error) {console.trace('OUCH!', error);}

    if (syncedRestaurants.length > 0) {
        storeRestaurants = await DBHelper.getStore(RESTAURANT_STORE, dbService);
        syncedRestaurants.forEach((restaurants) => {
            storeRestaurants.put(restaurants);
        });
    }

    if (syncedReviews.length > 0) {
        storeReviews = await DBHelper.getStore(REVIEWS_STORE, dbService);
        syncedReviews.forEach((review) => {
            storeReviews.delete(review.unsyncedId);
            delete review.unsyncedId;
            storeReviews.put(review);
        });
    }

    if (unsyncedRestaurants.length === 0 && unsyncedReviews.length === 0) {
        return null;
    }

    return `Server sync completed. ${syncedRestaurants.length + syncedReviews.length} item(s).`;
  }

}

