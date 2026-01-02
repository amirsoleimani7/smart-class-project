import { emit } from "../core/events.js";
import { on } from "../core/events.js";   // 🔴 THIS LINE WAS MISSING

let mainMenuButton = document.querySelector('#mainHomeButton');
let chartsButton = document.querySelector('#chartsButton');

let mainSection = document.querySelector('.main');
let bottomFooter = document.querySelector('.dataMenu');
let charts = document.querySelector('.charts');

mainMenuButton.addEventListener('click', () => {
  mainSection.style.display = 'flex';
  bottomFooter.style.display = 'flex';
  charts.style.display = 'none';
});

chartsButton.addEventListener('click', () => {
  mainSection.style.display = 'none';
  bottomFooter.style.display = 'none';
  charts.style.display = 'grid';

  /* 🔥 Tell charts they are now visible */
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
