// core/events.js

const listeners = Object.create(null);

/**
 * Subscribe to an event
 * @param {string} eventName
 * @param {(payload:any)=>void} callback
 */
export function on(eventName, callback) {
  if (!listeners[eventName]) {
    listeners[eventName] = [];
  }

  listeners[eventName].push(callback);

  // return unsubscribe function (IMPORTANT)
  return () => {
    listeners[eventName] =
      listeners[eventName].filter(cb => cb !== callback);
  };
}

/**
 * Emit an event
 * @param {string} eventName
 * @param {any} payload
 */
export function emit(eventName, payload) {
  if (!listeners[eventName]) return;

  // clone to avoid mutation during iteration
  [...listeners[eventName]].forEach(cb => {
    try {
      cb(payload);
    } catch (err) {
      console.error(`Error in event "${eventName}"`, err);
    }
  });
}

/**
 * Subscribe once
 * @param {string} eventName
 * @param {(payload:any)=>void} callback
 */
export function once(eventName, callback) {
  const off = on(eventName, (payload) => {
    off();
    callback(payload);
  });
}

/**
 * Remove all listeners (debug / reset)
 */
export function clearEvents() {
  Object.keys(listeners).forEach(key => delete listeners[key]);
}
