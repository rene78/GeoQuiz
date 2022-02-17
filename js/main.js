import { localeCountry, localeString } from './localeUtils.js';
import { continentsGeoJSON } from '../data/continents.js';
import { africaGeoJSON } from '../data/africa.js';
import { americaGeoJSON } from '../data/america.js';
import { europeGeoJSON } from '../data/europe.js';
import { asiaGeoJSON } from '../data/asia.js';

let myMap;
let leafletContinentLayer;
let continentGeoJSON;
let overallCountriesToQuery;
let correctAnswers = 0;
let timer;
let timePlayed = 0;

//Add the base map without any layers.
addLeafletMap();

//Load the continents GeoJSON
showContinentsGeoJson();

//Show request
document.querySelector(".command").innerText = localeString("selectContinent");

//Add a Leaflet map to the page
function addLeafletMap() {
  const EsriWorldShadedRelief = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    maxZoom: 13,
    minZoom: 2
  });

  myMap = L.map('map', {
    //center: [0, 0], //defined by "fitBounds"
    //zoom: 4, //defined by "fitBounds"
    zoomControl: false, //hide zoom control buttons
    layers: EsriWorldShadedRelief
  });
}

//Show GeoJSON polygons of all continents on the Leaflet map so the user can select the continent he wants to guess the countries from
function showContinentsGeoJson() {
  let leafletContinents = L.geoJSON(continentsGeoJSON, {
    onEachFeature: onEachFeature,
    style: style
  })
  // console.log(leafletContinents.getLayers());
  leafletContinents.addTo(myMap);
  //Center and zoom the map on the provided GeoJSON
  myMap.fitBounds(leafletContinents.getBounds());
  //What happens when clicking or hovering over each polygon
  function onEachFeature(feature, layer) {
    // console.log(feature);
    // console.log(layer);

    //Change opacity to 0.9 when polygon gets focus
    layer.on('mouseover', function (e) {
      // console.log(layer);
      highlightOnOff(0.9, feature);
    });

    //Change opacity back to 0.7 when polygon loses focus
    layer.on('mouseout', function (e) {
      highlightOnOff(0.7, feature);
    });

    //bind click
    layer.on('click', function (e) {
      let selectedContinent = feature.properties.continent;
      // console.log(selectedContinent);
      startGame(selectedContinent);
    });

    //Add contintent name as a tooltip (TODO: Add translation - "America", "Asia, Australia and Oceania", "Europe and Russia", "Africa")
    const tooltipContent = feature.properties.continent;
    layer.bindTooltip(tooltipContent);
  }

  //Style the polygons according to continent
  function style(feature) {
    let style = { "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2 };
    // console.log(feature.properties.continent);
    switch (feature.properties.continent) {
      case 'africa': style.fillColor = "#4F93C0"; break;
      case 'asia': style.fillColor = "#8A84A3"; break;
      case 'europe': style.fillColor = "#D5DC76"; break;
      case 'america': style.fillColor = "#AC5C91"; break;
    }
    // console.log(style);
    return style;
  }

  function highlightOnOff(fillOpacity, feature) {

    let continentOfHighlightedPolygon = feature.properties.continent;
    // console.log(continentOfHighlightedPolygon);

    //For each layer (i.e. polygon) of the layerGroup (i.e. the GeoJSON) the code below is executed.
    leafletContinents.eachLayer(function (layer) {
      if (layer.feature.properties.continent == continentOfHighlightedPolygon) {
        layer.setStyle({ fillOpacity }) //equals "fillOpacity: fillOpacity"
      }
    });
  };
}

//Remove continents GeoJSON, show the GeoJSON of the selected continent on the map and move on to newCountry functions
function startGame(continent) {
  switch (continent) {
    case 'africa': continentGeoJSON = africaGeoJSON; break;
    case 'asia': continentGeoJSON = asiaGeoJSON; break;
    case 'europe': continentGeoJSON = europeGeoJSON; break;
    case 'america': continentGeoJSON = americaGeoJSON; break;
    default: console.error("Wrong input for continent");
  }

  overallCountriesToQuery = continentGeoJSON.features.length;

  myMap.eachLayer(function (layer) {
    if (!!layer.toGeoJSON) { //Can the layer be converted into a valid GeoJSON? Will be true for all but the tile layer.
      myMap.removeLayer(layer);
    }
  });
  startStopTimer("start"); //Start timer
  showSingleContinentGeoJson(continentGeoJSON); //Load the geojson
  newCountry(); //Query the first country
}

//Show GeoJSON polygons of a single continent on the Leaflet map
function showSingleContinentGeoJson(inputGeoJson) {
  leafletContinentLayer = L.geoJSON(inputGeoJson, {
    onEachFeature: onEachFeature,
    style: style
  })

  leafletContinentLayer.addTo(myMap);

  //Center and zoom the map on the provided GeoJSON
  myMap.fitBounds(leafletContinentLayer.getBounds());

  //Apply standard colors to the polygons
  //(each object or "feature" is computed by this function)
  function style() {
    return { "fillColor": undefined, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2 };
  }

  //What happens when clicking or hovering over each polygon
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
}

//Randomly select a new country from the array. Then remove it from array so that it won't be queried again.
function newCountry() {
  if (continentGeoJSON.features.length) {
    // console.log("Length: " + continentGeoJSON.features.length);
    let rndNumber = Math.floor(Math.random() * (continentGeoJSON.features.length - 1));
    // console.log(rndNumber);
    check(rndNumber);
    //Remove country from array so that it is not queried again
    // console.log(continentGeoJSON.features);
    continentGeoJSON.features.splice(rndNumber, 1);
    let currentGameCounter = overallCountriesToQuery - continentGeoJSON.features.length;
    // console.log(currentGameCounter + "/" + overallCountriesToQuery);
    document.querySelector(".progress").innerText = currentGameCounter + "/" + overallCountriesToQuery;
  } else {
    console.log("Game finished!");
    startStopTimer("stop");
    console.log("Correct answers: " + correctAnswers + " out of " + overallCountriesToQuery + " queried countries");
    document.querySelector(".command").innerText = "Finished!";
  }
}

//Check if player selected the correct country
function check(index) {
  const requestedCountryISO = continentGeoJSON.features[index].properties.iso_a3;
  // console.log(requestedCountryISO);

  document.querySelector(".command").innerHTML = `${localeString("select")} ${localeCountry(requestedCountryISO)}`;

  let selectedCountry;

  leafletContinentLayer.on('click', function (e) {
    var layer = e.layer;
    // console.log(e);
    if (layer.wasClicked) return;

    selectedCountry = e.layer.feature.properties.iso_a3;
    // console.log(selectedCountry);
    leafletContinentLayer.off('click');//Stop listening for click events after first click
    hideCommandModal();//Hide country-select-command modal
    if (selectedCountry === requestedCountryISO) {
      correctAnswers++;
      openResultModal("success", localeString("correct"));
      colorQueriedCountryAndAddTooltip(requestedCountryISO, "green");
    }
    else {
      openResultModal("alarm", localeString("wrong"));
      colorQueriedCountryAndAddTooltip(requestedCountryISO, "red");
    }
    setTimeout(newCountry, 1800);//await animation before starting the next country
  });

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
    const command = document.querySelector(".command-container");
    command.classList.remove("hide-command");
    void command.offsetWidth; //Found here: https://css-tricks.com/restart-css-animation/#update-another-javascript-method-to-restart-a-css-animation
    command.classList.add("hide-command");
  }

  //Colour the polygon of the country just queried either green (correctly selected) or red (incorrectly selected).
  //Furthermore add a tooltip in order to see the country name when hovering over it.
  function colorQueriedCountryAndAddTooltip(requestedCountryISO, color) {
    //For each layer (i.e. polygon) the code below is executed.
    leafletContinentLayer.eachLayer(function (layer) {
      if (layer.feature.properties.iso_a3 === requestedCountryISO) {
        layer.setStyle({ fillColor: color });
        layer._path.classList.add("not-allowed-cursor");
        layer.wasClicked = true;

        //Add country name no queried country as a tooltip
        const tooltipContent = localeCountry(requestedCountryISO);
        layer.bindTooltip(tooltipContent);
      }
    });
  }
}

//Start/end timer
function startStopTimer(command) {
  if (command === "start") {
    timer = setInterval(function () {
      timePlayed++;
      document.querySelector(".time-elapsed").innerText = timePlayed + "s";
    }, 1000);
  } else {
    clearInterval(timer);
    console.log("Time needed: " + timePlayed + "s");
  }
}