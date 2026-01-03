// // src/js/ui/gestureDebug.js (or whatever file you had this in)
// import { on } from "../core/events.js";

// /**
//  * Make an action readable in the UI (matches your new backend actions)
//  */
// function formatAction(action) {
//   if (!action || typeof action !== "object") return "Action: (invalid)";

//   // buzzer
//   if (action.target === "buzzer" && action.command === "beep") {
//     return "Action: BEEP (state change)";
//   }

//   // UI hints (you currently don't send any in the new backend, but keep support)
//   if (action.target === "ui" && action.command === "hint") {
//     return action.text ? `Action: ${action.text}` : "Action: (hint)";
//   }

//   // lights
//   if (action.target === "light") {
//     const name = `Light ${action.id ?? "?"}`;
//     if (action.command === "on") return `Action: ${name} ON`;
//     if (action.command === "off") return `Action: ${name} OFF`;
//     return `Action: ${name} (${action.command})`;
//   }

//   // door
//   if (action.target === "door") {
//     if (action.command === "open") return "Action: Door OPEN";
//     if (action.command === "close") return "Action: Door CLOSE";
//     return `Action: Door (${action.command})`;
//   }

//   // curtain
//   if (action.target === "curtain") {
//     if (action.command === "open") return "Action: Curtain OPEN";
//     if (action.command === "close") return "Action: Curtain CLOSE";
//     return `Action: Curtain (${action.command})`;
//   }

//   return `Action: ${action.target} ${action.command ?? ""}`.trim();
// }

// /**
//  * Push a line into your command log area (instead of alert box).
//  * Your CSS already styles `.command` items.
//  */
// function pushLogLine(text, category = "command") {
//   const logRoot = document.querySelector(".commandLog");
//   if (!logRoot) return;

//   const ts = new Date().toLocaleTimeString(undefined, { hour12: false });

//   const div = document.createElement("div");
//   div.className = "command";
//   div.dataset.category = category;
//   div.textContent = `${ts} : [${category}] : ${text}`;

//   logRoot.appendChild(div);
//   logRoot.scrollTop = logRoot.scrollHeight;
// }

// // Log raw gesture labels (optional)
// on("gesture:current", (gesture) => {
//   console.log("Gesture:", gesture);
//   pushLogLine(`Gesture: ${gesture}`, "command");
// });

// // Log mapped actions from backend (this is what matters)
// on("action:received", (action) => {
//   console.log("Action:", action);
//   pushLogLine(formatAction(action), "command");
// });

// src/js/ui/gestureDebug.js
import { on } from "../core/events.js";

function pushLogLine(text, category = "command") {
  const logRoot = document.querySelector(".commandLog");
  if (!logRoot) return;

  const ts = new Date().toLocaleTimeString(undefined, { hour12: false });

  const div = document.createElement("div");
  div.className = "command";
  div.dataset.category = category;
  div.textContent = `${ts} : [${category}] : ${text}`;

  logRoot.appendChild(div);
  logRoot.scrollTop = logRoot.scrollHeight;
}

/**
 * Make an action readable in the UI (matches your new backend actions)
 */
function formatAction(action) {
  if (!action || typeof action !== "object") return "(invalid action)";

  if (action.target === "buzzer" && action.command === "beep") {
    return "BEEP (state change)";
  }

  if (action.target === "light") {
    const id = action.id ?? "?";
    if (action.command === "on") return `Light ${id} ON`;
    if (action.command === "off") return `Light ${id} OFF`;
    return `Light ${id} (${action.command})`;
  }

  if (action.target === "door") {
    if (action.command === "open") return "Door OPEN";
    if (action.command === "close") return "Door CLOSE";
    return `Door (${action.command})`;
  }

  if (action.target === "curtain") {
    if (action.command === "open") return "Curtain OPEN";
    if (action.command === "close") return "Curtain CLOSE";
    return `Curtain (${action.command})`;
  }

  return `${action.target} ${action.command ?? ""}`.trim();
}

// Optional: log raw gesture labels (can be noisy)
on("gesture:current", (gesture) => {
  pushLogLine(`Gesture: ${gesture}`, "command");
});

// Log mapped actions from backend
on("action:received", (action) => {
  pushLogLine(`Action: ${formatAction(action)}`, "command");
});