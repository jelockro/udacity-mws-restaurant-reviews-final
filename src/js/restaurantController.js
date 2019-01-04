import fetchJson from './fetchJson.js';
const RESTAURANTS_URL = "http://localhost:1337/restaurants";


export default function fetchRestaurants() {
// if not offline capable
    return new Promise ((resolve) => {
        fetchJson(RESTAURANTS_URL).then(jsonData => {
            let restaurantsArray = jsonData;
            resolve(restaurantsArray);
        }).catch(e => {
            console.log("did not fetch:", e);
        })
    })
}

export function fetchRestaurantById(id) {
    return new Promise ((resolve) => {
        fetchJson(RESTAURANTS_URL.concat(`/${id}`)).then(jsonData => {
            let restaurantData = jsonData;
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

export function fetchNeighborhoods() {
    return new Promise ((resolve) => {
        fetchRestaurants().then(restaurantJson => {
            let restaurantArray = restaurantJson;
            let neighborhoods = restaurantArray.map((objectIndex, restaurant) => restaurantArray[restaurant].neighborhood);
            const uniqueNeighborhoods = neighborhoods.filter((city, currentIndex) => neighborhoods.indexOf(city) === currentIndex);
            resolve(uniqueNeighborhoods);
        }).catch(e => {
            console.log("unable to filter the results:", e);
        })
    })
}

export function fetchCuisines() {
    return new Promise ((resolve) => {
        fetchRestaurants().then(restaurantJson => {
            let restaurantArray = restaurantJson;
            let cuisines = restaurantArray.map((objectIndex, restaurant) => restaurantArray[restaurant].cuisine_type);
            const uniqueCuisines = cuisines.filter((cuisine_type, currentIndex) => cuisines.indexOf(cuisine_type) === currentIndex);
            resolve(uniqueCuisines);
        }).catch(e => {
            console.log("unable to filter the results:", e);
        })
    })
}

// takes restaurant object as argument
export function getURLQuery(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }