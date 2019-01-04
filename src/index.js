import _ from 'lodash';
import "./styles/scss/index.scss";
import "./js/fetchJson.js";
import "./templates/index.html";
import initMap, {addMarkersToMap} from "./js/mapController";
import { fetchRestaurants, fetchRestaurantById, fetchRestaurantByCuisine, fetchRestaurantByNeighborhood, fetchNeighborhoods, fetchCuisines } from './js/restaurantDataController';
import { updateRestaurants } from './js/restaurantDisplayController';

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



document.addEventListener('DOMContentLoaded', (event) => {
    //debugger;
    initMap(); // added
    addMarkersToMap(fetchRestaurants())
    updateRestaurants()
  });
if (module.hot) {
    module.hot.accept('./js/restaurantDataController', function() {
    console.log('Accepting the updated fetchRestaurant module!');
    fetchRestaurants();
}) 
}