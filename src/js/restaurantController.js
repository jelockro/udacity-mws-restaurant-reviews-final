import fetchJson from './fetchJson.js';
const RESTAURANTS_URL = "http://localhost:1337/restaurants";
let restaurantsArray;
let restaurantData;

export default function fetchRestaurants() {
// if not offline capable
    return new Promise ((resolve) => {
        fetchJson(RESTAURANTS_URL).then(jsonData => {
            restaurantsArray = jsonData;
            resolve(restaurantsArray);
        }).catch(e => {
            console.log("did not fetch:", e);
        })
    })
}

export function fetchRestaurantById(id) {
    return new Promise ((resolve) => {
        fetchJson(RESTAURANTS_URL.concat('/', String(id))).then(jsonData => {
            restaurantData = jsonData;
            resolve(restaurantData);
        }).catch(e => {
            console.log("did not fetch:", e);
        })
    })
}

export function fetchRestaurantByCuisine(cuisine) {
    return new Promise ((resolve) => {
        fetchRestaurants().then(restaurantArray => {
            let restaurantsFilteredByCusisine = restaurantArray.filter(r => r.cuisine_type === cuisine);
            resolve(restaurantsFilteredByCusisine);
        }).catch(e => {
            console.log("unable to filter the results:", e);
        })
    })
}

export function fetchRestaurantByNeighborhood(neighborhood) {
    return new Promise ((resolve) => {
        fetchRestaurants().then(restaurantArray => {
            let restaurantsFilteredByNeighborhood = restaurantArray.filter(r => r.neighborhood === neighborhood);
            resolve(restaurantsFilteredByNeighborhood);
        }).catch(e => {
            console.log("unable to filter the results:", e);
        })
    })
}
