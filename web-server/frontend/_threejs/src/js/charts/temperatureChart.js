import { on } from "../core/events.js";

export function initTemperatureChart() {
  const chart = echarts.init(document.getElementById("temprature"));

  const t = [], v = [];

  chart.setOption({
    title: { text: "Temperature (°C)", left: "center" },
    xAxis: { type: "category", data: t },
    yAxis: { type: "value", name: "°C" },
    series: [{
      type: "line",
      data: v,
      smooth: true,
      showSymbol: false
    }]
  });

  on("charts:shown", () => requestAnimationFrame(() => chart.resize()));

  on("sensor:temperature", value => update(chart, t, v, value));
}

function update(chart, t, v, value) {
  t.push(time());
  v.push(value);
  trim(t, v);
  chart.setOption({ xAxis: { data: t }, series: [{ data: v }] });
}

const time = () => new Date().toLocaleTimeString();
const trim = (t, v, m = 60) => t.length > m && (t.shift(), v.shift());
