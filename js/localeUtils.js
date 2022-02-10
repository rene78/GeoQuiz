const languages = ["de", "en"]; //Available languages on website. To be updated when a new language is added in Transifex
const preferredBrowserLanguage = getPreferredBrowserLanguage();

//Check the preferred browser languages and see, if we have a translation for it
//Go through all preferred languages defined in the browser and take the first match. If no match - English will be loaded.
function getPreferredBrowserLanguage() {
  // console.log(navigator.languages);
  for (let i = 0; i < navigator.languages.length; i++) {
    const navigatorLanguage = navigator.languages[i].slice(0, 2); //Just keep the first 2 letters (e.g. en-US --> en)
    // console.log(navigatorLanguage);
    if (languages.indexOf(navigatorLanguage) !== -1) return navigatorLanguage;
  }
  return "en"; //if none of the preferred browser languages is available on our site go with default (English)
}

//Translate text
const languageFilePreferredLanguage = await loadLanguageFile(preferredBrowserLanguage); //Load language file of preferred browser language
const languageFileEN = await loadLanguageFile("en"); //Load fallback language (English)

async function loadLanguageFile(locale) {
  const linkToLanguageFile = "./locales/" + locale + ".json";
  const response = await fetch(linkToLanguageFile);
  const languageFile = await response.json();
  return languageFile;
}

export function localeString(localeString) {
  // console.log(locale);
  return languageFilePreferredLanguage[localeString] || languageFileEN[localeString];//load translation. If empty string --> fall back to English
}

//Translate countries
import { countryNames } from '../locales/countryNames.js';

export function localeCountry(countryToLookUpAlpha3) {
  countryToLookUpAlpha3 = countryToLookUpAlpha3.toLowerCase();//Change country code to lower case, e.g. TUN --> tun
  // console.log(countryToLookUpAlpha3);
  const countryToLookUpIndex = countryNames.findIndex(i => i.alpha3 === countryToLookUpAlpha3);//Locate index of country in countryNames array
  // console.log(countryToLookUpIndex);
  // console.log(preferredBrowserLanguage);
  const countryName = countryNames[countryToLookUpIndex][preferredBrowserLanguage];//load country name in preferred language
  const countryNameFallback = countryNames[countryToLookUpIndex]["en"];//load English country name in case of countryName=undefined
  // console.log(countryName || countryNameFallback);
  return countryName || countryNameFallback; //return country name - if not available in preferred language then in EN
}