// core/state.js
import { emit } from "./events.js";



//  this is the strucure of the data
export const state = {
  esp32: { connected: false },
  esp8266: { connected: false },
  sensors: {
    temp: null,
    humidity: null
  }
};

export function updateState(payload) {
  Object.assign(state, payload);
  emit("state:update", state);
}
