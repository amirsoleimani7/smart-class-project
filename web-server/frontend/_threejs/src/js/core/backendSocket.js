import { emit } from "./events.js";

const ws = new WebSocket("ws://127.0.0.1:8000/ws/dashboard");

ws.onopen = () => {
  console.log("Connected to backend");
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "sensor") {
    const data = msg.data;

    if (data.temperature !== undefined)
      emit("sensor:temperature", data.temperature);

    if (data.humidity !== undefined)
      emit("sensor:humidity", data.humidity);

    if (data.co2 !== undefined)
      emit("sensor:co2", data.co2);

    if (data.light !== undefined)
      emit("sensor:light", data.light);

    if (data.noise !== undefined)
      emit("sensor:noise", data.noise);
  
    if (data.pressure !== undefined)
      emit("sensor:pressure", data.pressure);

  }

  if (msg.type === "status" && msg.device === "esp8266") {
    emit("esp8266:status", msg.connected);
  }

};

ws.onerror = (err) => {
  console.error("Backend socket error", err);
};
