import { localeCountry, localeString } from './localeUtils.js';
import { continentsGeoJSON } from '../data/continents.js';
import { africaGeoJSON } from '../data/africa.js';
import { americaGeoJSON } from '../data/america.js';
import { europeGeoJSON } from '../data/europe.js';
import { asiaGeoJSON } from '../data/asia.js';

let myMap;
let leafletContinentLayer;
let continentGeoJSON;
let selectedContinent;
let overallCountriesToQuery;
let countryNumbersArray;
let correctAnswers = 0;
let timer;
let timePlayed = 0;

//Add the base map without any layers.
addLeafletMap();

//Load the continents GeoJSON
showContinentsGeoJson();



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
//Show message "Select continent"
function showContinentsGeoJson() {
  //Show request
  document.querySelector(".command").innerText = localeString("selectContinent");

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
      selectedContinent = feature.properties.continent;
      // console.log(selectedContinent);
      startGame();
    });

    //Add contintent name as a tooltip
    const tooltipContent = localeString(feature.properties.continent);
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
function startGame() {
  switch (selectedContinent) {
    case 'africa': continentGeoJSON = africaGeoJSON; break;
    case 'asia': continentGeoJSON = asiaGeoJSON; break;
    case 'europe': continentGeoJSON = europeGeoJSON; break;
    case 'america': continentGeoJSON = americaGeoJSON; break;
    default: console.error("Wrong input for continent");
  }

  overallCountriesToQuery = continentGeoJSON.features.length;

  //Define an array with exactly the same length as the amount of countries to query, e.g. [0, 1, 2, 3]
  countryNumbersArray = Array.from({ length: overallCountriesToQuery }, (v, i) => i);

  removeAllGeoJSON(); //Remove all GeoJSON layers before loading the continent
  showSingleContinentGeoJson(continentGeoJSON); //Load the geojson
  startCountdownAnimation()//Show 3-2-1 countdown before game starts. Afterwards start the game.
}

//Remove all GeoJSON layers before loading the continent
function removeAllGeoJSON() {
  myMap.eachLayer(function (layer) {
    if (!!layer.toGeoJSON) { //Can the layer be converted into a valid GeoJSON? Will be true for all but the tile layer.
      myMap.removeLayer(layer);
    }
  });
}

//Show 3-2-1 countdown before game starts. Afterwards start the game.
function startCountdownAnimation() {
  let elements = document.querySelectorAll(".countdown");
  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.add('start-animation');
  }

  //Blur the background during countdown timer animation
  let elementsToBlur = document.querySelectorAll(".to-blur");
  for (var i = 0; i < elementsToBlur.length; i++) {
    elementsToBlur[i].classList.add('blur');
  }

  //After 4s start the game timer and query the first country
  //Remove animation class again after 4s, so that startCountdownAnimation() can be called again
  setTimeout(function () {
    startStopTimer("start"); //Start timer
    newCountry(); //Query the first country
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('start-animation');
    }
    //Unblur the background after countdown timer animation
    let elementsToBlur = document.querySelectorAll(".to-blur");
    for (var i = 0; i < elementsToBlur.length; i++) {
      elementsToBlur[i].classList.remove('blur');
    }
  }, 3500)
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
//Do some stuff once the last country has been queried
function newCountry() {
  if (countryNumbersArray.length) {
    let rndNumber = Math.floor(Math.random() * (countryNumbersArray.length - 1));
    // console.log(rndNumber);
    check(countryNumbersArray[rndNumber]);
    //Remove country from array so that it is not queried again
    // console.log(countryNumbersArray);
    countryNumbersArray.splice(rndNumber, 1);
    let currentGameCounter = overallCountriesToQuery - countryNumbersArray.length;
    // console.log(currentGameCounter + "/" + overallCountriesToQuery);
    document.querySelector(".progress").innerText = currentGameCounter + "/" + overallCountriesToQuery;
  } else {
    console.log("Game finished!");
    startStopTimer("stop");
    console.log("Correct answers: " + correctAnswers + " out of " + overallCountriesToQuery);
    document.querySelector(".command").innerText = "Finished!";
    let position = updateHighscore();
    displayEndOfGameInfobox(position);
  }
}

//Check if player selected the correct country
function check(index) {
  const requestedCountryISO = continentGeoJSON.features[index].properties.iso_a3;
  // console.log(requestedCountryISO);

  document.querySelector(".command").innerHTML = `${localeString("select")} ${localeCountry(requestedCountryISO)}`;

  let selectedCountry;

  leafletContinentLayer.on('click', function (e) {
    let layer = e.layer;
    // console.log(e);
    if (layer.wasClicked) return;

    selectedCountry = e.layer.feature.properties.iso_a3;
    console.log(selectedCountry);
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
      document.querySelector(".time-elapsed").innerText = "\u{1F557}" + timePlayed + "s";
    }, 1000);
  } else {
    clearInterval(timer);
    console.log("Time needed: " + timePlayed + "s");
  }
}

//Display end-of-game infobox
function displayEndOfGameInfobox(position) {
  document.querySelector(".end-of-game-infobox").classList.add("show");
  document.querySelector(".end-of-game-infobox-heading").innerText = "Result";
  if (!position) document.querySelector(".end-of-game-infobox-result").innerHTML =`Correct answers: ${correctAnswers} out of ${overallCountriesToQuery} (${Math.round(correctAnswers / overallCountriesToQuery * 100)}%)<br>This is not good enough for a position in the highscore`;// Math.round(correctAnswers / overallCountriesToQuery * 100) + "% correct in " + timePlayed + "s<br>This is not good enough for a position in the highscore";
  else document.querySelector(".end-of-game-infobox-result").innerText = "Very good! You reached the highscore!";
  let tableHtml = `
    <thead>
      <tr>
      <th colspan="3">Highscore - ${localeString(selectedContinent)}</th>
      </tr>
      <tr>
        <th>Position</th>
        <th>Correct answers (%)</th>
        <th>Time needed</th>
      </tr>
    </thead>
    <tbody>
  `;
  const retrievedHighscoreFromLocalStorage = JSON.parse(localStorage.getItem(selectedContinent));
  for (let i = 0; i < retrievedHighscoreFromLocalStorage.length; i++) {
    const timePlayed = retrievedHighscoreFromLocalStorage[i].timePlayed;
    const successRate = retrievedHighscoreFromLocalStorage[i].successRate;
    tableHtml += i === position - 1 ? `<tr id="last-game">` : `<tr>`;//define class to color row red or green
    tableHtml += `<td>${i + 1}</td>`;
    tableHtml += `<td>${Math.round(successRate * 100)}%</td>`;
    tableHtml += `<td>${timePlayed < 60 ? `${timePlayed}s` : `${Math.floor(timePlayed / 60)}min ${timePlayed % 60}s`}</td>`;
    tableHtml += `</tr>`;
  }
  tableHtml += `
    </tbody>
  `;
  document.querySelector(".end-of-game-infobox-highscore").innerHTML = tableHtml;
}

//Start a new game when clicking on "Play again"
document.querySelector(".play-again-button").addEventListener("click", function () {
  document.querySelector(".end-of-game-infobox").classList.remove("show"); //Hide end of game infobox
  removeAllGeoJSON(); //Remove all GeoJSON layers before reloading the continents GeoJSON
  showContinentsGeoJson();
  //Reset some global variables and update display
  correctAnswers = 0;
  timePlayed = 0;
  document.querySelector(".progress").innerText = "";
  document.querySelector(".time-elapsed").innerText = "";
});

//Update/create highscore array and save to localstorage
function updateHighscore() {
  const successRate = successRateCalc();
  let newEntry = { successRate, timePlayed };
  // console.log(newEntry);

  // Try to retrieve from LS
  const retrievedHighscoreFromLocalStorage = localStorage.getItem(selectedContinent);
  //Entry in localstorage found
  if (retrievedHighscoreFromLocalStorage !== null) {
    //  take the highscore, update, save back to localstorage
    let continentHighscoreFromLocalStorage = JSON.parse(retrievedHighscoreFromLocalStorage);

    for (let i = 0; i < continentHighscoreFromLocalStorage.length; i++) {
      //is the success rate higher OR is the success rate similar + the time lower than this entry in array?
      if (newEntry.successRate > continentHighscoreFromLocalStorage[i].successRate ||
        (newEntry.successRate === continentHighscoreFromLocalStorage[i].successRate && newEntry.timePlayed < continentHighscoreFromLocalStorage[i].timePlayed)) {
        continentHighscoreFromLocalStorage.splice(i, 0, newEntry); //if yes: insert before this entry
        continentHighscoreFromLocalStorage.pop(); //remove last entry so that we have a highscore with 5 entries again
        localStorage.setItem(selectedContinent, JSON.stringify(continentHighscoreFromLocalStorage));
        console.log("Highscore for " + selectedContinent + " in localstorage updated");
        return i + 1; //Return position in highscore
      }
    }

    //No entry in localstorage found
  } else {
    //  No highscore yet. Take the empty one from below with the first entry being newEntry
    console.log("No highscore yet. Take the empty one from below with the first entry being newEntry");
    let continentHighscore = [
      newEntry,
      { successRate: 0.00, timePlayed: 0 },
      { successRate: 0.00, timePlayed: 0 },
      { successRate: 0.00, timePlayed: 0 },
      { successRate: 0.00, timePlayed: 0 }
    ];
    //Save to local storage
    localStorage.setItem(selectedContinent, JSON.stringify(continentHighscore));
    return 1; //Return position in highscore
  }

  //New entry not good enough for highscore. No changes to highscore in localstorage.
  console.log("New entry not good enough for highscore. No changes to highscore in localstorage.");
  return false;
}

//Return success rate
function successRateCalc() {
  return correctAnswers / overallCountriesToQuery;
}