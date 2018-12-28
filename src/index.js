import _ from 'lodash';
import "./styles/scss/index.scss";

import printMe from './print.js';
import "./templates/index.html";

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

  if (module.hot) {
      module.hot.accept('./print.js', function() {
          console.log('Accepting the updated printMe module!');
          printMe();
      }) 
  }