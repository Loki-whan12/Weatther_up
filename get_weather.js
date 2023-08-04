const search_city = document.getElementById('city');
const error = document.getElementById('error');
const lat = document.getElementById('latitude');
const lon = document.getElementById('longitude');
const btnGet = document.getElementById('btnGet');
const btnCurrLoc = document.getElementById('btnCurrent');
const mapSection = document.getElementById("map_section");
const suggestions = document.getElementById('suggestions');
const map = L.map('map');
const map_el = document.getElementById('map');
const url = "https://nominatim.openstreetmap.org/search?format=json&limit=3&q=";
let cityBaseEndPoint = "https://api.teleport.org/api/cities/?search=";
const key = "Your API key";
const lang = "en";
const units = "metric";

function displayMap(isTrue, lat_val, lon_val, zoom_val){
    map.setView([lat_val, lon.value], zoom_val);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
    if(isTrue){
        L.marker([lat_val, lon_val]).addTo(map);
    }
}

btnGet.addEventListener('click', getWeather);
btnCurrLoc.addEventListener('click', getCurrLoc);

displayMap(false, 10, -10, 5);

search_city.addEventListener('input', async () => {
    let endpoint = cityBaseEndPoint+search_city.value
    let result = await(await fetch(endpoint)).json();
    suggestions.innerHTML = "";
    let cities = result._embedded['city:search-results'];
    let length = cities.length > 5 ? 5 : cities.length;
    for(let i = 0; i < length; i++){
        let option = document.createElement('option');
        option.value = cities[i].matching_full_name;
        suggestions.appendChild(option);
    }
});


const successCallback =  (position) => {
    //got position
    lat.value = position.coords.latitude.toFixed(2);
    lon.value = position.coords.longitude.toFixed(2);
}

const errorCallback = (err) => {
    //geolocation failed
    console.error(err);
}

function getCurrLoc(){
    search_city.value = "Current Location";
    let opts = {
        enableHighAccuracy: true,
        timeout: 1000 * 10, //10 seconds
        maximumAge: 1000 * 60 * 5, //5 minutes
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, opts);
}

///weather function
function getWeather(){
    if(search_city.value.length > 1 ){
        if(!(search_city.value == "Current Location")){
            getCoordiFrmCityName();
        }
        fetchWeather();
        displayMap(true, lat.value, lon.value, 13);
    }else{
        alert("Please input a city name!");
    }
}

function displayCoordinates() {
    if (addressArr.length > 0) {
        error.innerText = "";
        lat.value = parseFloat(addressArr[0].lat).toFixed(2);
        lon.value = parseFloat(addressArr[0].lon).toFixed(2);
    }else{
        error.innerText  = "Sorry city not found!";
    }
}

async function getCoordiFrmCityName(){
    await( fetch(url+search_city.value) )
        .then(response => response.json())
        .then(data => addressArr = data)
        .then(show => displayCoordinates())
        .catch(err => console.log(err));
}

function fetchWeather(){   
    if(search_city.value.length > 1){
        let url_opneweathermap = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat.value}&lon=${lon.value}&appid=${key}&units=${units}&lang=${lang}`;
        //fetch the weather
        fetch(url_opneweathermap)
            .then((resp) => {
            if (!resp.ok) throw new Error(resp.statusText);
            return resp.json();
            })
            .then((data) => {
                showWeather(data);
            })
            .catch(console.err);
    }
}

function showWeather(resp){
    let row = document.querySelector('.all_cards');
    //clear out the old weather and add the new
    row.innerHTML = '';
    row.innerHTML = resp.daily
        .map((day, idx) => {
          if (idx <= 2) {
            let dt = new Date(day.dt * 1000); //timestamp * 1000
            let sr = new Date(day.sunrise * 1000).toTimeString();
            let ss = new Date(day.sunset * 1000).toTimeString();
            return `<div class="card">
            <h5 >${dt.toDateString()}</h5>
            <div class="top-card">
            <img
            src="http://openweathermap.org/img/wn/${
                day.weather[0].icon
              }@4x.png"
            class="card-img-top"
            alt="${day.weather[0].description}"
            title="${day.weather[0].description}"
            />
            </div>
            <div class="card-body">
                <h3 class="card-title">${day.weather[0].main}</h3>
                <p class="card-text">High ${day.temp.max}&deg;C Low ${
                    day.temp.min
                  }&deg;C</p>
                          <p class="card-text">High Feels like ${
                            day.feels_like.day
                          }&deg;C</p>
                          <p class="card-text">Pressure ${day.pressure}mb</p>
                          <p class="card-text">Humidity ${day.humidity}%</p>
                          <p class="card-text">UV Index ${day.uvi}</p>
                          <p class="card-text">Precipitation ${day.pop * 100}%</p>
                          <p class="card-text">Dewpoint ${day.dew_point}</p>
                          <p class="card-text">Wind ${day.wind_speed}m/s, ${
                    day.wind_deg
                  }&deg;</p>
                          <p class="card-text">Sunrise ${sr}</p>
                          <p class="card-text">Sunset ${ss}</p>
                </div>
            </div>`;
          }
        })
        .join(' ');
}
