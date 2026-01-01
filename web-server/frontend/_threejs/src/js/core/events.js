// core/events.js
const events = {};

export function on(event, handler) {
  (events[event] ||= []).push(handler);
}

export function emit(event, data) {
  (events[event] || []).forEach(fn => fn(data));
}
