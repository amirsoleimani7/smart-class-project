// src/js/ui/commandLog.js
import { on } from "../core/events.js";

// ---- DOM ----
const logRoot = document.querySelector(".commandLog");
const filterInputs = Array.from(document.querySelectorAll('input[name="cat"]'));

if (!logRoot) throw new Error(".commandLog not found");

// ---- state ----
/**
 * entry = { id, ts, category: "command"|"connection"|"error", message, meta? }
 */
const entries = [];
let currentFilter = "all";
let nextId = 1;

// optional: if you still want to show latest gesture, only log when it changes
let lastGesture = null;

function nowTime() {
  return new Date().toLocaleTimeString(undefined, { hour12: false });
}

function formatEntry(e) {
  return `${e.ts} : [${e.category}] : ${e.message}`;
}

function shouldShow(entry, filter) {
  if (filter === "all") return true;
  return entry.category === filter;
}

function render() {
  const frag = document.createDocumentFragment();

  for (const e of entries) {
    if (!shouldShow(e, currentFilter)) continue;

    const div = document.createElement("div");
    div.className = "command";
    div.dataset.category = e.category;
    div.dataset.id = String(e.id);
    div.textContent = formatEntry(e);
    frag.appendChild(div);
  }

  logRoot.replaceChildren(frag);
  logRoot.scrollTop = logRoot.scrollHeight;
}

export function makeLog(category, message, meta = null) {
  const entry = {
    id: nextId++,
    ts: nowTime(),
    category, // "command" | "connection" | "error"
    message,
    meta,
  };

  entries.push(entry);

  const MAX = 300;
  if (entries.length > MAX) entries.splice(0, entries.length - MAX);

  render();
  return entry;
}

// ---- radio filtering ----
// IMPORTANT: your radio values must match these:
// all / command / error / connection
for (const input of filterInputs) {
  input.addEventListener("change", (e) => {
    currentFilter = e.target.value;
    render();
  });
}

render();

// ----------------------
// Event hookups
// ----------------------

// Connection logs
on("esp8266:status", (connected) => {
  makeLog("connection", connected ? "ESP8266 Connected" : "ESP8266 Disconnected");
});

on("gesture:status", (connected) => {
  makeLog("connection", connected ? "Camera/AI Connected" : "Camera/AI Disconnected");
});

// Gesture logs (optional)
// If you truly don’t want gestures, delete this block.
on("gesture:current", (gesture) => {
  if (gesture === lastGesture) return;
  lastGesture = gesture;
  makeLog("command", `Gesture: ${gesture}`);
});

// Mapped action logs (this is the main thing)
on("action:received", (action) => {
  makeLog("command", `Action: ${formatAction(action)}`, action);
});

// Backend/socket error logs (if you emit errors somewhere later)
// on("backend:error", (err) => makeLog("error", String(err)));

// ---- action formatter ----
function formatAction(action) {
  if (!action || typeof action !== "object") return "(invalid action)";

  if (action.target === "ui" && action.command === "hint") {
    return action.text ?? "(hint)";
  }

  if (action.target === "light") {
    const id = action.id ?? "?";
    if (action.command === "on") return `Light ${id} ON`;
    if (action.command === "off") return `Light ${id} OFF`;
    return `Light ${id} ${action.command}`;
  }

  if (action.target === "door") {
    if (action.command === "open") return "Door OPEN";
    if (action.command === "close") return "Door CLOSE";
    return `Door ${action.command}`;
  }

  if (action.target === "curtain") {
    if (action.command === "open") return "Curtain OPEN";
    if (action.command === "close") return "Curtain CLOSE";
    return `Curtain ${action.command}`;
  }

  return `${action.target} ${action.command ?? ""}`.trim();
}