import { emit } from "./events.js";

/* Utility */
const rand = (min, max, fixed = 2) =>
  +(Math.random() * (max - min) + min).toFixed(fixed);

/* Emit fake sensor data every second */
setInterval(() => {
  emit("sensor:temperature", rand(20, 30));
  emit("sensor:humidity", rand(40, 65));
  emit("sensor:co2", rand(400, 1500, 0));
  emit("sensor:light", rand(100, 900, 0));
  emit("sensor:noise", rand(30, 80));

  emit("net:latency", rand(10, 120, 0));
  emit("net:packetLoss", rand(0, 5));
}, 1000);

/* Optional: motion events (sporadic) */
setInterval(() => {
  if (Math.random() > 0.85) {
    emit("sensor:motion", 1);
  }
}, 3000);
