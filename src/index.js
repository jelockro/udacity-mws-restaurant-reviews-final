import _ from 'lodash';
import "./styles/scss/index.scss";
import "./js/fetchJson.js";
import "./templates/index.html";
import initMap, {addMarkersToMap} from "./js/map";
import fetchRestaurants, { fetchRestaurantById, fetchRestaurantByCuisine, fetchRestaurantByNeighborhood, fetchNeighborhoods, fetchCuisines } from './js/restaurantController';

// *** Removing service worker for faster styling development ****

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/service-worker.js')
//             .then(registration => {
//                 console.log('SW registered:', registration);
//             }).catch(registrationError => {
//                 console.log('SW registration failed: ', registrationError);
//             });
//     });
// }

fetchRestaurants().then(result => {console.log(result)})
fetchRestaurantById(3).then(result => {console.log(result)})
fetchRestaurantByCuisine("Asian").then(result =>{console.log(result)})
fetchRestaurantByNeighborhood("Manhattan").then(result =>{console.log(result)})
fetchNeighborhoods().then(result=>{console.log(result)})
fetchCuisines().then(result=>{console.log(result)})
initMap()
addMarkersToMap(fetchRestaurants())
if (module.hot) {
    module.hot.accept('./js/restaurantController', function() {
    console.log('Accepting the updated fetchRestaurant module!');
    fetchRestaurants();
}) 
}