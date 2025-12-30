import { updateState } from "../core/state.js";

let socket = null;

export function initSocket() {
  socket = new WebSocket("ws://YOUR_SERVER_URL");

  socket.onopen = () => {
    updateState({
      esp32: { connected: true }
    });
  };

  socket.onclose = () => {
    updateState({
      esp32: { connected: false }
    });
  };

  socket.onerror = () => {
    updateState({
      esp32: { connected: false }
    });
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateState(data);
  };
}
