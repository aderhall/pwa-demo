"use strict";

let swChannel = null;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Register the service worker
    navigator.serviceWorker
      .register("./service_worker.js")
      .then(() => {
        document.getElementById("js").textContent = "[Verified: service worker registered successfully]";
      })
      .catch(err => {
        document.getElementById("js").textContent = "[Error: service worker failed to register]";
        console.log("Service worker failed to register: ", err);
      });
    
    // Create a message channel to communicate with the service worker
    swChannel = new MessageChannel();
    // Send the sw one of the ports
    navigator.serviceWorker.controller.postMessage(
      { type: 'INIT_PORT' },
      [swChannel.port2]
    );
    // Watch for messages from the sw
    swChannel.port1.onmessage = messageEvent => {
      // This is just an example, the service worker could send it actually useful messages
      console.log(messageEvent.data.payload);
    }
    
    // Check if there is a connection to the server
    updateConnectionStatus();
  });
}

function updateConnectionStatus() {
  checkConnection().then(connected => {
    setConnectionStatus(connected);
    setTimeout(updateConnectionStatus, 5000);
  });
}

window.addEventListener("offline", () => {
  setConnectionStatus(false);
});
window.addEventListener("online", () => {
  setConnectionStatus(true);
});

function setConnectionStatus(connected) {
  document.getElementById("offline-notif").className = connected ? "" : "visible";
}

async function checkConnection() {
  try {
    await fetch(window.location.origin, { method: "HEAD" });
    return true;
  } catch {
    return false;
  }
}