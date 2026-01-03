import { on } from "../core/events.js";

/* DOM references */
const tempEl  = document.getElementById("tem-data");
const humEl   = document.getElementById("hum-data");
const presEl  = document.getElementById("pres-data");
const noiseEl = document.getElementById("noise-data");
const smokeEl = document.getElementById("Smoke-data");

/* Find the corresponding dataEntry by data-sensor attr */
function entry(sensorName) {
  return document.querySelector(`.dataEntry[data-sensor="${sensorName}"]`);
}

/* Pulse manager */
const staleAfterMs = 3000; // if no update for 3s => stale
const timers = new Map();

function markFlow(sensorName) {
  const el = entry(sensorName);
  if (!el) return;

  el.classList.add("is-flowing");
  el.classList.remove("is-stale");

  // reset stale timer
  clearTimeout(timers.get(sensorName));
  timers.set(sensorName, setTimeout(() => {
    el.classList.remove("is-flowing");
    el.classList.add("is-stale");
  }, staleAfterMs));
}

/* Temperature */
on("sensor:temperature", (value) => {
  tempEl.textContent = `${value} °C`;
  markFlow("temperature");
});

/* Humidity */
on("sensor:humidity", (value) => {
  humEl.textContent = `${value} %`;
  markFlow("humidity");
});

/* Pressure */
on("sensor:pressure", (value) => {
  presEl.textContent = `${value} hPa`;
  markFlow("pressure");
});

/* Noise */
on("sensor:noise", (value) => {
  noiseEl.textContent = `${value} dB`;
  markFlow("noise");
});

/* Smoke (co2) */
on("sensor:co2", (value) => {
  smokeEl.textContent = `${value} ppm`;
  markFlow("co2");
});

["temperature","humidity","pressure","noise","co2"].forEach(s => {
  const el = entry(s);
  if (el) el.classList.add("is-stale");
});

