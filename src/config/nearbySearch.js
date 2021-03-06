import store from "../store/index";
import setMarkers from "./setMarkers";
import firebaseConfig from "./firebase";


export default function () {
  const API_KEY = firebaseConfig.apiKey;

  const map = store.state.map;
  const google = store.state.google;
  const service = new google.maps.places.PlacesService(map);

  const center = map.getCenter();

  const nearbySearchRequest = {
    location: center,
    radius: 650,
    types: ["restaurant"]
  };

  function nearbySearchCallback(results, status) {
    if (status == 'OK') {
      let restaurants = results;
      if (restaurants.length > 9) {
        restaurants.length = 9;
      }

      restaurants.forEach((restaurant) => {
        function getDetailsCallback(reviews) {
          /*if (reviews == null || reviews == undefined) {
            setTimeout(function () {
              service.getDetails(getDetailsRequest, getDetailsCallback);
            }, 250);
          }*/
          /*if (reviews.reviews == undefined) {
            reviews.reviews = [];
          }*/
          restaurant.reviews = reviews;
          const lat = restaurant.geometry.location.lat();
          const lng = restaurant.geometry.location.lng();
          restaurant.img = `https://maps.googleapis.com/maps/api/streetview?size=150x150&location=${lat},${lng}&key=${API_KEY}`;
        }

        const getDetailsRequest = {
          fields: ["reviews"],
          placeId: restaurant.place_id
        };

        service.getDetails(getDetailsRequest, getDetailsCallback())

        if (restaurant.rating == undefined) {
          restaurant.rating = "X";
        } else {
          restaurant.rating = restaurant.rating.toFixed(1);
        }
      });
      store.commit("UPDATE_RESTAU", restaurants);
      setMarkers();

    }
  }

  service.nearbySearch(nearbySearchRequest, nearbySearchCallback);
}