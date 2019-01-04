import _ from 'lodash';
import "./styles/scss/index.scss";
import "./js/fetchJson.js";
import "./templates/index.html";
import fetchRestaurants from './js/restaurantController';

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

if (module.hot) {
    module.hot.accept('./js/restaurantController', function() {
    console.log('Accepting the updated fetchRestaurant module!');
    fetchRestaurants();
}) 
}