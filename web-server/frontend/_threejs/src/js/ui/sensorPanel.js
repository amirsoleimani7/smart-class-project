import { on } from "../core/events.js";

/* DOM references */
const tempEl = document.getElementById("tem-data");
const humEl = document.getElementById("hum-data");
const presEl = document.getElementById("pres-data");
const noiseEl = document.getElementById("noise-data");
const smokeEl = document.getElementById("Smoke-data");

/* Temperature */
on("sensor:temperature", (value) => {
  tempEl.textContent = `${value} °C`;
});

/* Humidity */
on("sensor:humidity", (value) => {
  humEl.textContent = `${value} %`;
});

/* Pressure */
on("sensor:pressure", (value) => {
  presEl.textContent = `${value} hPa`;
});

/* Noise */
on("sensor:noise", (value) => {
  noiseEl.textContent = `${value} dB`;
});

/* Smoke */
on("sensor:co2", (value) => {
  smokeEl.textContent = `${value} ppm`;
});
