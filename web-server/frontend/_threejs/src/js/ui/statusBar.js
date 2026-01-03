import { emit } from "../core/events.js";
import { on } from "../core/events.js";

const mainMenuButton = document.querySelector('#mainHomeButton');
const chartsButton = document.querySelector('#chartsButton');

const mainPage = document.querySelector('.mainPage');
const chartsPage = document.querySelector('.chartsPage');

mainMenuButton.addEventListener('click', () => {
  chartsPage.classList.remove('is-active');
  mainPage.classList.add('is-active');
});

chartsButton.addEventListener('click', () => {
  mainPage.classList.remove('is-active');
  chartsPage.classList.add('is-active');

  emit("charts:shown");
});

const dataButton = document.getElementById("dataConnection");

on("esp8266:status", (connected) => {
  if (connected) {
    dataButton.classList.add("connected");
    dataButton.classList.remove("disconnected");
    dataButton.querySelector("span").textContent = "ESP8266 Connected";
  } else {
    dataButton.classList.add("disconnected");
    dataButton.classList.remove("connected");
    dataButton.querySelector("span").textContent = "ESP8266 Disconnected";
  }
});
