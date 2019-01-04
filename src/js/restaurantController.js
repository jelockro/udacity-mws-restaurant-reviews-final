import fetchJson from './fetchJson.js';
const RESTAURANTS_URL = "http://localhost:1337/restaurants";
let restaurantArray;

export default function fetchRestaurants() {
// if not offline capable
    return new Promise ((resolve,reject) => {
        fetchJson(RESTAURANTS_URL).then(jsonData => {
            console.log(jsonData);
            console.log()
            restaurantArray = jsonData;
            resolve(restaurantArray);
        }).catch(e => {
            console.log("did not fetch:", e);
        })
    })
}

