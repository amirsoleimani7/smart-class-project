import { emit } from "../core/events.js";

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
