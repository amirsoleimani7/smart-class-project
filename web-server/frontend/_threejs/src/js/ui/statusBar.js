// ui/statusBar.js
import { on } from "../core/events.js";

on("state:update", (state) => {
  updateESPStatus(state.esp32.connected);
});
