// charts/noiseChart.js
import { on } from "../core/events.js";

export function initNoiseChart() {
  const el = document.getElementById("noise");
  const chart = echarts.init(el);

  const times = [];
  const raw = [];
  const avg = [];

  chart.setOption({
    title: { text: "Noise (dB)", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: times },
    yAxis: { type: "value", name: "dB" },
    series: [
      { name: "Raw", type: "bar", data: raw },
      { name: "Avg", type: "line", data: avg, smooth: true }
    ]
  });

  on("charts:shown", () => {
    requestAnimationFrame(() => chart.resize());
  });

  on("sensor:noise", value => {
    update(chart, times, raw, avg, value);
  });
}

function update(chart, t, raw, avg, val) {
  t.push(ts());
  raw.push(val);

  const window = raw.slice(-5);
  avg.push(
    window.reduce((a, b) => a + b, 0) / window.length
  );

  trim(t, raw, avg);
  chart.setOption({
    xAxis: { data: t },
    series: [{ data: raw }, { data: avg }]
  });
}

const ts = () => new Date().toLocaleTimeString();
const trim = (t, r, a, m = 60) =>
  t.length > m && (t.shift(), r.shift(), a.shift());
