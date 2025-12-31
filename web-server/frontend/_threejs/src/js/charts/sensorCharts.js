// charts/sensorCharts.js
import { on } from "../core/events.js";

// TODO add the coresposning charts for each item

// testing 

// Initialize the echarts instance based on the prepared dom
var myChart = echarts.init(document.getElementById('temprature'));
console.log(`width of the item is : ${document.querySelector('#temprature').offsetWidth} , height is : ${document.querySelector('#temprature').offsetHeight}`);

// Specify the configuration items and data for the chart
var option = {
  title: {
    text: 'ECharts Getting Started Example'
  },
  tooltip: {},
  legend: {
    data: ['sales']
  },
  xAxis: {
    data: ['Shirts', 'Cardigans', 'Chiffons', 'Pants', 'Heels', 'Socks']
  },
  yAxis: {},
  series: [
    {
      name: 'sales',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
};

// Display the chart using the configuration items and data just specified.
myChart.setOption(option);
