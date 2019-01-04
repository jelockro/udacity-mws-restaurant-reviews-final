import _ from 'lodash';
import "./styles/scss/index.scss";
import "./js/fetchJson.js";
import printMe from './print.js';
import "./templates/index.html";
import fetchJson from './js/fetchJson.js';

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

fetchJson('http://localhost:1337/restaurants').then(data => {console.log(data)});


if (module.hot) {
    module.hot.accept('./js/fetchJson', function() {
    console.log('Accepting the updated fetchJson module!');
    printMe();
}) 
}