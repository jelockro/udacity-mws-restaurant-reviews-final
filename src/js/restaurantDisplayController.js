import { getURLQuery, getImageURLQuery, fetchRestaurantByCuisineAndNeighborhood } from "./restaurantDataController";




/**
 * Update page and map for current restaurants.
 */
export function updateRestaurants(){
  console.log("Uspdating DOM Elements");
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(result => {
    // resetRestaurants(restaurants);
    fillRestaurantsHTML(result);
    })
}

export function fillRestaurantsHTML(restaurantObjectArray) {
  console.log('filling restaurant HTML');
  const ul = document.getElementById('restaurants-list');
  Object.entries(restaurantObjectArray).forEach(([key,restaurant]) => {
    ul.append(createRestaurantHTML(restaurant));
  });
}
/**
 * Create restaurant HTML.
 */
export function createRestaurantHTML(restaurant) {
  console.log("Creating Restaurant HTML for each Restaurant");
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  const imgurlbase = getImageURLQuery(restaurant, 'tiles');
 
  const imgurl1x = imgurlbase + '-tile_1x.jpg';
  const imgurl2x = imgurlbase + '-tile_2x.jpg';
   

  image.src = imgurl1x;
  image.srcset = imgurl1x +' 300w, ' + imgurl2x + ' 600w';
  image.alt = restaurant.name + ' restaurant promotional image';
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details Page';
  more.href = getURLQuery(restaurant);
  li.append(more);

  return li;
}
