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