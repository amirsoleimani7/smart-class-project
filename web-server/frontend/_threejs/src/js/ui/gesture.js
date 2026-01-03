import { on } from "../core/events.js";

/**
 * Make an action readable in the UI
 */
function formatAction(action) {
  if (!action || typeof action !== "object") return "Action: (invalid)";

  // UI hints from backend
  if (action.target === "ui" && action.command === "hint") {
    return action.text ? `Action: ${action.text}` : "Action: (hint)";
  }

  // lights
  if (action.target === "light") {
    const name = `Light ${action.id ?? "?"}`;
    if (action.command === "on") return `Action: ${name} ON`;
    if (action.command === "off") return `Action: ${name} OFF`;
    return `Action: ${name} (${action.command})`;
  }

  // door
  if (action.target === "door") {
    if (action.command === "open") return "Action: Door OPEN";
    if (action.command === "close") return "Action: Door CLOSE";
    return `Action: Door (${action.command})`;
  }

  // curtain (future)
  if (action.target === "curtain") {
    if (action.command === "open") return "Action: Curtain OPEN";
    if (action.command === "close") return "Action: Curtain CLOSE";
    return `Action: Curtain (${action.command})`;
  }

  return `Action: ${action.target} ${action.command ?? ""}`.trim();
}

// Show the raw gesture coming from the model
on("gesture:current", (gesture) => {
  console.log("Gesture:", gesture);
  showAlert(`Gesture: ${gesture}`);
});

// Show the mapped action coming from the backend
on("action:received", (action) => {
  console.log("Action:", action);
  showAlert(formatAction(action));
});