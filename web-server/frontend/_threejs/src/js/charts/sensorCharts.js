// charts/sensorCharts.js

import { initTemperatureChart } from "./temperatureChart.js";
import { initHumidityChart } from "./humidityChart.js";
import { initCO2Chart } from "./co2Chart.js";

import { initLightChart } from "./lightChart.js";
import { initNoiseChart } from "./noiseChart.js";
import { initLatencyChart } from "./latencyChart.js";
import { initPacketLossChart } from "./packetLossChart.js";

initTemperatureChart();
initHumidityChart();
initCO2Chart();

initLightChart();
initNoiseChart();
initLatencyChart();
initPacketLossChart();

