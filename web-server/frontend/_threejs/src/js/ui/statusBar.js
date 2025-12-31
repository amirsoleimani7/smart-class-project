// ui/statusBar.js
import { on } from "../core/events.js";

// not sure about this part
on("state:update", (state) => {
  updateESPStatus(state.esp32.connected);
});


// chaning view for based on the MainMenu or charts Button
let mainMenuButton = document.querySelector('#mainHomeButton');
let chartsButton = document.querySelector('#chartsButton');

let mainSection = document.querySelector('.main');
let buttomFooter = document.querySelector('.dataMenu');
let charts = document.querySelector('.charts')


mainMenuButton.addEventListener('click' , (e) => {
  mainSection.style.display = 'flex';
  buttomFooter.style.display = 'flex';
  charts.style.display = 'none';
})


chartsButton.addEventListener('click' , (e) => {
  mainSection.style.display = 'none';
  buttomFooter.style.display = 'none';
  charts.style.display = 'grid';  
})




