import { emit } from "../core/events.js";
import { on } from "../core/events.js";

const mainMenuButton = document.querySelector("#mainHomeButton");
const chartsButton = document.querySelector("#chartsButton");

const mainPage = document.querySelector(".mainPage");
const chartsPage = document.querySelector(".chartsPage");

// pick one root element to hold the mode
const root = document.body; // or document.querySelector(".wrapper")

function setMode(mode) {
  root.classList.toggle("mode-main", mode === "main");
  root.classList.toggle("mode-charts", mode === "charts");
}

mainMenuButton.addEventListener("click", () => {
  chartsPage.classList.remove("is-active");
  mainPage.classList.add("is-active");
  setMode("main");
});

chartsButton.addEventListener("click", () => {
  mainPage.classList.remove("is-active");
  chartsPage.classList.add("is-active");
  setMode("charts");
  emit("charts:shown");
});

// initial mode (because mainPage starts active)
setMode("main");
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
