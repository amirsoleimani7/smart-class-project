// charts/pressureChart.js
import { on } from "../core/events.js";
import { makeChartResponsive  } from "../core/events.js";

export function initPressureChart() {
  const el = document.getElementById("pressure");
  const chart = echarts.init(el);
  makeChartResponsive(chart, el, ["charts:shown"]);


  const times = [];
  const raw = [];
  const avg = [];

  chart.setOption({
    title: { text: "Pressure (hPa)", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: times },
    yAxis: { type: "value", name: "hPa" },
    series: [
      {
        name: "Raw",
        type: "bar",
        data: raw,
        itemStyle: {
          color: "#5470C6"
        }
      },
      {
        name: "Avg",
        type: "line",
        data: avg,
        smooth: true,
        lineStyle: {
          width: 2,
          color: "#91CC75"
        },
        symbol: "none"
      }
    ]
  });

  // 🔁 resize when charts tab becomes visible
  on("charts:shown", () => {
    requestAnimationFrame(() => chart.resize());
  });

  // 📡 sensor update
  on("sensor:pressure", value => {
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
