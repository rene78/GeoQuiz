import { localeString } from './localeUtils.js';

const continents = ["africa", "asia", "america", "australia", "europe"];
let highscores = document.querySelector("#highscores");
let noHighscoreCounter = 0;

document.querySelector("#heading").innerText = localeString("highscore");

for (let i = 0; i < continents.length; i++) {
  const retrievedHighscoreFromLocalStorageJSON = localStorage.getItem(continents[i]);
  //Entry in localstorage found
  if (retrievedHighscoreFromLocalStorageJSON !== null) {
    let retrievedHighscoreFromLocalStorage = JSON.parse(retrievedHighscoreFromLocalStorageJSON);
    let tableHtml = `
    <table class="highscore-${continents[i]}">
      <thead>
        <tr>
        <th colspan="3">${localeString(continents[i])}</th>
        </tr>
        <tr>
          <th>${localeString("position")}</th>
          <th>${localeString("correctAnswers")}</th>
          <th>${localeString("timeNeeded")}</th>
        </tr>
      </thead>
      <tbody>
  `;

    for (let i = 0; i < retrievedHighscoreFromLocalStorage.length; i++) {
      const timePlayed = retrievedHighscoreFromLocalStorage[i].timePlayed;
      const successRate = retrievedHighscoreFromLocalStorage[i].successRate;
      tableHtml += `<tr>`;
      tableHtml += `<td>${i + 1}</td>`;
      tableHtml += `<td>${Math.round(successRate * 100)}%</td>`;
      tableHtml += `<td>${timePlayed < 60 ? `${timePlayed}${localeString("secondsAbbr")}` : `${Math.floor(timePlayed / 60)}${localeString("minutesAbbr")} ${timePlayed % 60}${localeString("secondsAbbr")}`}</td>`;
      tableHtml += `</tr>`;
    }
    tableHtml += `
      </tbody>
    </table>
  `;
    highscores.insertAdjacentHTML("beforeend", tableHtml);
  } else noHighscoreCounter++
}

if (noHighscoreCounter === 5) {
  highscores.innerText = "No game played so far";
}