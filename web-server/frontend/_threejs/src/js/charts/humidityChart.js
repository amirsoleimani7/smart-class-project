import { on } from "../core/events.js";

export function initHumidityChart() {
  const chart = echarts.init(document.getElementById("humidity"));
  const t = [], v = [];

  chart.setOption({
    title: { text: "Humidity (%)", left: "center" },
    xAxis: { type: "category", data: t },
    yAxis: { type: "value", name: "%" },
    series: [{ type: "line", data: v, smooth: true }]
  });

  on("charts:shown", () => requestAnimationFrame(() => chart.resize()));
  on("sensor:humidity", value => update(chart, t, v, value));
}

const update = (c,t,v,val)=>{t.push(ts());v.push(val);trim(t,v);c.setOption({xAxis:{data:t},series:[{data:v}]});}
const ts=()=>new Date().toLocaleTimeString();
const trim=(t,v,m=60)=>t.length>m&&(t.shift(),v.shift());
