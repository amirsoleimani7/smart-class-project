import "./network/socket.js";
import "./three/classroom.js";
import "./ui/commandLog.js";
import "./ui/statusBar.js";
import "./charts/sensorCharts.js";

// import { initSocket } from "./network/socket.js";


// initSocket();

// current time handling 
// var today = new Date();
// document.getElementById('time').innerHTML=today;

function updateTime() {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const time = date.toLocaleTimeString();
    const day = date.toLocaleDateString(undefined, options);
    document.getElementById('day').innerHTML =`${day}`;
    document.getElementById('time').innerHTML =`${time}`;
}

setInterval(updateTime, 1000);
updateTime();
