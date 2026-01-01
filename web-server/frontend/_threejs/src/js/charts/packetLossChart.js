// charts/packetLossChart.js
import { on } from "../core/events.js";

export function initPacketLossChart() {
  const el = document.getElementById("packetLoss");
  const chart = echarts.init(el);

  const times = [];
  const values = [];

  chart.setOption({
    title: { text: "Packet Loss (%)", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: times },
    yAxis: { type: "value", name: "%" },
    series: [{
      name: "Packet Loss",
      type: "bar",
      data: values
    }]
  });

  on("charts:shown", () => {
    requestAnimationFrame(() => chart.resize());
  });

  on("net:packetLoss", value => {
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
