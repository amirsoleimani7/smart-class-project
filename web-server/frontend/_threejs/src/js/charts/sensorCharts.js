// charts/sensorCharts.js
import { on } from "../core/events.js";


// not sure about this one yet
on("state:update", (state) => {
  addTempPoint(state.sensors.temp);
});
