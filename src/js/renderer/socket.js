// deno-lint-ignore-file
var conListener = false;
var disListener = false;

var socketOnline = () => {
  const element = `<div class="socket-card-content">
  <div class="socket-status-bar">
    <div class="socket-info">
      <span class="pulse-dot online"></span>
      <span class="socket-info-text">WebSocket Gateway Active</span>
    </div>
    <div class="socket-button-controller">
      <button id="disconnect" type="button" class="btn-danger-sm">Disconnect Gateway</button>
    </div>
  </div>
  <form id="socket-message" class="socket-message-form">
    <div class="socket-input-wrapper">
      <input type="text" id="message" name="message" placeholder="Send raw command to overlay server (e.g. spt: player -- player)..." autocomplete="off">
      <button type="submit" class="btn-primary-sm">Send</button>
    </div>
  </form>
</div>`;

  const controller = document.querySelector("#socket-controller");
  if (controller) controller.innerHTML = element;

  consoleController(true);

  if (conListener === false) {
    const form = document.querySelector("#socket-message");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.querySelector("#message");
        const message = input ? input.value : "";
        if (!message) return;
        if (typeof ws !== "undefined" && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
        if (input) input.value = "";
      });
    }

    const disBtn = document.querySelector("#disconnect");
    if (disBtn) {
      disBtn.addEventListener("click", () => {
        if (typeof ws !== "undefined" && ws) {
          ws.close();
        }
      });
    }

    conListener = true;
  }
};

var socketOffline = () => {
  const element = `<div class="socket-card-content offline">
  <div class="socket-offline-bar">
    <div class="socket-info">
      <span class="pulse-dot offline"></span>
      <span class="socket-info-text">WebSocket Disconnected</span>
    </div>
    <div class="socket-button-controller">
      <button id="reconnect" type="button" class="btn-primary-sm">Reconnect Gateway</button>
    </div>
  </div>
</div>`;

  const controller = document.querySelector("#socket-controller");
  if (controller) controller.innerHTML = element;

  consoleController(false);

  if (disListener === false) {
    const recBtn = document.querySelector("#reconnect");
    if (recBtn) {
      recBtn.addEventListener("click", () => {
        if (typeof id !== "undefined" && id) {
          socketConnector(atob(id));
        }
      });
    }

    disListener = true;
  }
};

var socketController = (online) => {
  const statusEl = document.querySelector("#socket-status");
  if (statusEl) {
    statusEl.innerHTML = online ? "🟢" : "🔴";
  }

  if (online) {
    disListener = false;
    socketOnline();
  } else {
    conListener = false;
    socketOffline();
  }
};

window.socketOnline = socketOnline;
window.socketOffline = socketOffline;
window.socketController = socketController;
