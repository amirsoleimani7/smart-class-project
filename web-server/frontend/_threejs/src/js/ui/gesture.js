import { on } from "../core/events.js";

on("gesture:current", (gesture) => {
  console.log("Gesture:", gesture);

  const alertBox = document.getElementById("alertBox");
  const alertText = alertBox?.querySelector(".alertText");
  if (alertText && alertBox) {
    alertText.textContent = `Gesture: ${gesture}`;
    alertBox.classList.add("active");
  }
});