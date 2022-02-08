let myMap;
let jsonLayer;

//Add the base map without any layers.
addLeafletMap();

//Load the example GeoJSON into the map
showGeoJson(exampleGeoJson);

//Add a Leaflet map to the page
function addLeafletMap() {
  const EsriWorldShadedRelief = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    maxZoom: 13,
    minZoom: 3
  });

  myMap = L.map('map', {
    center: [0, 0], //defined by "fitBounds"
    zoom: 4,
    layers: EsriWorldShadedRelief
  });
}

//Show GeoJSON polygons on the Leaflet map
function showGeoJson(inputGeoJson) {
  jsonLayer = L.geoJSON(inputGeoJson, {
    onEachFeature: onEachFeature,
    style: style
  })

  jsonLayer.addTo(myMap);

  //Center and zoom the map on the provided GeoJSON
  myMap.fitBounds(jsonLayer.getBounds());
}

//Apply standard colors to the polygons
//(each object or "feature" is computed by this function)
function style() {
  return { "fillColor": undefined, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2 };
}

function onEachFeature(feature, layer) {
  // console.log(feature);
  // console.log(layer);

  //Change opacity to 0.9 when polygon gets focus
  layer.on('mouseover', function (e) {
    layer.setStyle({ fillOpacity: 0.9 });
  });

  //Change opacity back to 0.7 when polygon loses focus
  layer.on('mouseout', function (e) {
    layer.setStyle({ fillOpacity: 0.7 });
  });

  //bind click
  // layer.on('click', function (e) {
  //   // console.log(e);
  //   console.log(feature.properties.name);
  // });
}

newCountry();

//Randomly select a new country from the array. Then remove it from array so that it won't be asked again.
function newCountry() {
  let rndNumber = Math.floor(Math.random() * (exampleGeoJson.features.length - 1));
  console.log(rndNumber);

  check(rndNumber);
  //Remove country from array so that it is not tested again
  console.log(exampleGeoJson.features);
  exampleGeoJson.features.splice(rndNumber, 1);
}

function check(index) {
  const requestedCountryISO = exampleGeoJson.features[index].properties.iso_a3;
  const requestedCountry = exampleGeoJson.features[index].properties.name;
  changeCountryNameInCommandModal();

  function changeCountryNameInCommandModal() {
    document.querySelector(".command").innerHTML = "Please select " + requestedCountry;
  }

  let selectedCountry;

  jsonLayer.on('click', function (e) {
    selectedCountry = e.layer.feature.properties.iso_a3;
    console.log(selectedCountry);
    jsonLayer.off('click');//Stop listening for click events after first click
    hideCommandModal();//Hide country-select-command modal
    if (selectedCountry === requestedCountryISO) {
      openResultModal("success", "Correct!");
      colorQueriedCountry(requestedCountryISO, "green");
    }
    else {
      openResultModal("alarm", "Wrong. That was " + e.layer.feature.properties.name);
      colorQueriedCountry(requestedCountryISO, "red");
    }
    setTimeout(newCountry, 1800);//await animation before starting the next country
  });
}

//Show result modal
function openResultModal(type, text) {
  const result = document.querySelector(".result");
  result.classList.remove("show", "alarm", "success");
  void result.offsetWidth; //Found here: https://css-tricks.com/restart-css-animation/#update-another-javascript-method-to-restart-a-css-animation
  result.innerHTML = text;
  result.classList.add("show", type);
}

//Hide command modal
function hideCommandModal() {
  const command = document.querySelector(".command");
  command.classList.remove("hide-command");
  void command.offsetWidth; //Found here: https://css-tricks.com/restart-css-animation/#update-another-javascript-method-to-restart-a-css-animation
  command.classList.add("hide-command");
}

//Colour the polygon of the country just queried either green (correctly selected) or red (incorrectly selected).
function colorQueriedCountry(requestedCountry, color) {
  //For each layer (i.e. polygon) the code below is executed.
  jsonLayer.eachLayer(function (layer) {
    if (layer.feature.properties.iso_a3 === requestedCountry) {
      layer.setStyle({ fillColor: color })
    }
  });
}