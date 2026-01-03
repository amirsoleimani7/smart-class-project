// charts/latencyChart.js
import { on } from "../core/events.js";
import { makeChartResponsive  } from "../core/events.js";

export function initLatencyChart() {
  const el = document.getElementById("latency");
  const chart = echarts.init(el);

  const times = [];
  const values = [];

  chart.setOption({
    title: { text: "Latency (ms)", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: times },
    yAxis: { type: "value", name: "ms" },
    series: [{
      name: "Latency",
      type: "line",
      data: values,
      smooth: false,          // 🔴 spikes visible
      showSymbol: true
    }]
  });

  on("charts:shown", () => {
    requestAnimationFrame(() => chart.resize());
  });

  on("net:latency", value => {
    update(chart, times, values, value);
  });
}

function update(chart, t, v, val) {
  t.push(ts());
  v.push(val);
  trim(t, v);
  chart.setOption({ xAxis: { data: t }, series: [{ data: v }] });
}

const ts = () => new Date().toLocaleTimeString();
const trim = (t, v, m = 60) =>
  t.length > m && (t.shift(), v.shift());
