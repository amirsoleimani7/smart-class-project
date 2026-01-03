// charts/lightChart.js
import { on } from "../core/events.js";
import { makeChartResponsive  } from "../core/events.js";

export function initLightChart() {
  const el = document.getElementById("light");
  const chart = echarts.init(el);
  makeChartResponsive(chart, el, ["charts:shown"]);


  const times = [];
  const values = [];

  chart.setOption({
    title: { text: "Light (lx)", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: times },
    yAxis: { type: "value", name: "lx" },
    series: [{
      name: "Light",
      type: "line",
      data: values,
      smooth: true,
      areaStyle: {}          // 🔴 makes it area chart
    }]
  });

  on("charts:shown", () => {
    requestAnimationFrame(() => chart.resize());
  });

  on("sensor:light", value => {
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
