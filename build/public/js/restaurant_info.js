// import 'babel-polyfill';
// import register from './register';
// import idb from 'idb';
// import dbhelper from './dbhelper';

let restaurant;
var newMap;
const supportsNotifications = ('Notification' in window);
let form = this.document.getElementById('reviews-form');
form.addEventListener('submit', (event) => this.addReview(event));

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', async function(event) {
  initMap();
  const favoriteHitbox = document.getElementById('favorite-hitbox');
  favoriteHitbox.addEventListener('click', (event) => {
    toggleFavorite(event);
  });
  if(navigator.onLine) {
    // This sync will handle browsers that do not support online event and also when server is down without polling
    const message = await DBHelper.sync();
    if (supportsNotifications && Notification.permission === "default") {
        Notification.requestPermission().then(function(result) {
        });
    } 
    if (message) {
        if (supportsNotifications && Notification.permission === "granted") {
            new Notification(message);
        } else {
            //console.log(`DOMContentLoaded: ${message}`);
        }             
    }
  }
});

window.addEventListener('online', async function(event) {
    const message = await DBHelper.sync();
    if(!message) return;
    if (supportsNotifications && Notification.permission === "granted") {
        new Notification(message);
    } else {
        console.log(`online: ${message}`);
    }    
    initMap();        
}); 

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  //debugger;
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

let id = getParameterByName('id');
/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiamVsb2Nrcm8iLCJhIjoiY2ppZXoydmUxMGg5ZjNrb2Nuc3l0N2J0MSJ9.DVVsqyqurrIcRVgdKmGU-Q',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL, used only in
 * initializing the map
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
    
  // Toggle Heart-SVG for Favorite
  // const favorite_svg = document.getElementsByClassName('favorite-heart');
  const favoriteAnchor = document.getElementById('restaurant-favorite-anchor');
  let favoriteAnchorMessage;
 
  const favoriteFilled = document.getElementById('favorite-filled'); 
  const favoriteEmpty= document.getElementById('favorite-empty'); 
 
  if (restaurant.is_favorite === 'true' || restaurant.is_favorite === true) {
      favoriteFilled.setAttribute('style', 'display: inherit;');
      favoriteEmpty.setAttribute('style', 'display: none;');
      favoriteAnchorMessage = `Remove '${restaurant.name}' from your Faves`;

  } else {
      favoriteFilled.setAttribute('style', 'display: none;');
      favoriteEmpty.setAttribute('style', 'display: inherit;');
      favoriteAnchorMessage = `Make '${restaurant.name}' one of your Faves`;
  }
  favoriteAnchor.setAttribute('aria-label', favoriteAnchorMessage); 
  favoriteAnchor.innerHTML = favoriteAnchorMessage;
  
  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  const imgurlbase = DBHelper.imageUrlForRestaurant(restaurant, 'banners');
  const imgparts = imgurlbase.split('/');
  //console.log(imgparts);
  const imgurl1x = "/img/banners/" + imgparts[3] + '-banner_1x.jpg';
  const imgurl2x = "/img/banners/" + imgparts[3] + '-banner_2x.jpg'
  image.src = imgurl1x;
  image.srcset = imgurl1x +' 300w, ' + imgurl2x + ' 600w';
  image.alt = restaurant.name + ' restaurant promotional image';
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

}

async function toggleFavorite(event) {
    event.preventDefault();
    //console.log('before dbToggle, state of self.restaurant', self.restaurant);
    //console.log('before dbToggle, state of self.restaurant.is_favorite', self.restaurant.is_favorite);

    try {
        DBHelper.toggle(self.restaurant.id, self.restaurant.is_favorite)
          .then(success => {
            //console.log('Great Job', success);
            //console.log(self.restaurant.id);
            //self.location.reload();
            // fetchRestaurantFromURL((error, success) => {
            //   if (error) { console.log(error) } 
            //   else {console.log('fetchRestaurantFromUrl:', success)}
            // });
            self.restaurant = success;
            //fillRestaurantHTML(success);
            const favoriteAnchor = document.getElementById('restaurant-favorite-anchor');
            let favoriteAnchorMessage;
 
            const favoriteFilled = document.getElementById('favorite-filled'); 
            const favoriteEmpty= document.getElementById('favorite-empty'); 
            if (success.is_favorite === 'true' || success.is_favorite === true) {
              favoriteFilled.setAttribute('style', 'display: inherit;');
              favoriteEmpty.setAttribute('style', 'display: none;');
              favoriteAnchorMessage = `Remove '${success.name}' from your Faves`;

            } else {
                favoriteFilled.setAttribute('style', 'display: none;');
                favoriteEmpty.setAttribute('style', 'display: inherit;');
                favoriteAnchorMessage = `Make '${success.name}' one of your Faves`;
            }
            //console.log('after refilling what is the state: ', self.restaurant.is_favorite
            //, ' \n self.restaurant is: ', self.restaurant);
          })
          .catch(error => console.log('DB.toggle did not work'));
    } catch (err) {console.log('nothing worked', err)};
}
/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key.trim();
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key].trim();
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (id = self.restaurant.id) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  // need to fetch reviews, first from cache, then online
  DBHelper.fetchReviewsById(id, (error, reviews) => {
    if (error) {
      console.trace('unable to fetch reviews,', error);
    }
    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  });
}


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'restaurant-review-user';
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = Date.parse(review.createdAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}



addReview = async(event) => {
    event.preventDefault();
    const name = document.getElementById('name');
    const rating = document.getElementById('rating');
    const comments = document.getElementById('comments');
    const reviewErrors = document.getElementById('review-errors');
    const errors = await DBHelper.addReview({
        restaurant_id: self.restaurant.id,
        name: name.value,
        rating: rating.value,
        comments: comments.value,
    });

    if (errors.length === 0) {
        name.value = '';
        rating.value = '';
        comments.value = '';
        name.setAttribute('aria-invalid', 'false');
        rating.setAttribute('aria-invalid', 'false');
        comments.setAttribute('aria-invalid', 'false');
        if (reviewErrors.childNodes.length > 0) reviewErrors.removeChild(reviewErrors.childNodes[0]);
    } else {
        const container = document.createElement('div');
        container.id = 'review-errors-container';
        const header = document.createElement('p');
        header.id = 'review-errors-header';
        header.innerText = `${errors.length} error${errors.length > 1 ? 's': ''} are found in the submission.`
        container.appendChild(header);
        const list = document.createElement('ul');
        errors.forEach(error => {
            const item = document.createElement('li');
            let text;
            switch(error) {
                case 'name':
                    text = 'name cannot be null or empty';
                    name.setAttribute('aria-invalid', 'true');
                    break;
                case 'rating':
                    text = 'rating cannot be null or empty';
                    rating.setAttribute('aria-invalid', 'true');
                    break;
                case 'comments':
                    text = 'comments cannot be null or empty';
                    comments.setAttribute('aria-invalid', 'true');
                    break;
                case 'fetch':
                    text = 'Network connection is unavailable. Data will be resent when the connection is available.';  
                    name.value = '';
                    rating.value = '';
                    comments.value = '';
                    break;                                          
            }
            item.innerText = text;
            list.appendChild(item);
        });
        container.appendChild(list);
        const existingContainer = document.getElementById('review-errors-container');
        if (existingContainer) {
            reviewErrors.replaceChild(container, existingContainer);
        } else {
            reviewErrors.appendChild(container);
        }
    }
    //debugger;
    console.trace('self.restaurant.id:', self.restaurant.id);
    this.fillReviewsHTML(await DBHelper.getCachedReviews(self.restaurant.id));
    return false;
}
