import { emit } from "../core/events.js";

const socket = new WebSocket("ws://192.168.12.21:8080");

socket.addEventListener("open", () => {
  console.log("Socket connected");
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.temperature !== undefined) {
    emit("sensor:temperature", data.temperature);
  }
});

socket.addEventListener("close", () => {
  console.log("Socket disconnected");
});

export { socket };
