// deno-lint-ignore-file
var ws;

var socketConnector = (ip) => {
  const targetHost = ip || window.location.host || "localhost:3000";
  const ipEl = document.querySelector("#socket-target-ip");
  if (ipEl) {
    ipEl.innerText = targetHost;
  }

  const cleanHost = targetHost.replace(/^wss?:\/\//, "");
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${protocol}//${cleanHost}/ws`);
  window.ws = ws;

  ws.onopen = () => {
    console.log("Connected to server");
    socketController(true);

    if (typeof token !== "undefined" && token !== null) {
      ws.send("spt: SET TOKEN " + JSON.stringify(token));
      setTimeout(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send("spt: player -- player");
          ws.send("spt: pulling");
        }
      }, 300);
    }
  };

  ws.onmessage = (e) => {
    var msg = String(e.data);

    if (msg.startsWith("spt: ")) {
      if (typeof spotifyCommandHandler === "function") {
        spotifyCommandHandler(msg);
      } else {
        console.log("Spotify handler not loaded:", msg);
      }
    } else if (msg.startsWith("log: ")) {
      logHandler(msg);
    } else if (msg.startsWith("tt: ")) {
      if (typeof tiktokHandler === "function") {
        tiktokHandler(msg);
      } else {
        console.log("TikTok handler not loaded:", msg);
      }
    } else {
      console.log(msg);
    }
  };

  ws.onclose = () => {
    console.log("Disconnected from server");
    socketController(false);
    if (typeof tiktokController === "function") {
      tiktokController(false);
    }
  };
};

var controllerRenderer = (ip) => {
  const targetHost = ip || window.location.host || "localhost:3000";
  controllerFrame();
  spotifyInit();
  tiktokInitialElement();

  if (typeof initCoreUpdater === "function") {
    initCoreUpdater();
  }

  socketConnector(targetHost);
};

window.controllerRenderer = controllerRenderer;
window.socketConnector = socketConnector;
