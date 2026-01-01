import { on } from "../core/events.js";

export function initCO2Chart() {
  const chart = echarts.init(document.getElementById("co2"));
  const t=[], v=[];

  chart.setOption({
    title: { text: "CO₂ (ppm)", left: "center" },
    xAxis: { type: "category", data: t },
    yAxis: {
      type: "value",
      name: "ppm",
      splitArea: {
        show: true,
        areaStyle: {
          color: ["#e8f5e9", "#fffde7", "#ffebee"]
        }
      }
    },
    visualMap: {
      show: false,
      pieces: [
        { lte: 800, color: "#2ecc71" },
        { gt: 800, lte: 1200, color: "#f1c40f" },
        { gt: 1200, color: "#e74c3c" }
      ]
    },
    series: [{ type: "line", data: v, smooth: true }]
  });

  on("charts:shown",()=>requestAnimationFrame(()=>chart.resize()));
  on("sensor:co2", val => update(chart,t,v,val));
}

const update=(c,t,v,val)=>{t.push(ts());v.push(val);trim(t,v);c.setOption({xAxis:{data:t},series:[{data:v}]});}
const ts=()=>new Date().toLocaleTimeString();
const trim=(t,v,m=60)=>t.length>m&&(t.shift(),v.shift());
