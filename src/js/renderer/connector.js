// deno-lint-ignore-file
var connector = (ip) => {
  const cleanIp = ip.trim().replace(/^ws:\/\//, "").replace(/^http:\/\//, "");
  const encode = btoa(cleanIp);
  window.location.href = `${window.location.origin}/controller/?id=${encode}`;
};

var connectRenderer = () => {
  if (!document.querySelector('link[href*="connector.css"]')) {
    document.head.innerHTML += `<link rel="stylesheet" href="/core/src/css/connector.css">`;
  }

  const savedHost = window.localStorage.getItem("last-ws-host") || "localhost:3000";

  document.querySelector("#main").innerHTML = `<div class="main-container connector-page">
  <div class="connector-glow"></div>
  <div class="connector-card">
    <div class="connector-header">
      <div class="connector-badge">
        <span class="pulse-dot online"></span>
        <span>GATEWAY STANDBY</span>
      </div>
      <h1 class="connector-title">Stream Overlay Hub</h1>
      <p class="connector-subtitle">Connect to your local or remote WebSocket server to synchronize Spotify, TikTok chat, and stream overlays in real time.</p>
    </div>

    <form id="connector" class="connector-form">
      <label for="url" class="connector-label">WebSocket Host Address</label>
      <div class="input-wrapper">
        <span class="input-prefix">ws://</span>
        <input type="text" id="url" placeholder="localhost:3000" value="${savedHost}" required autofocus autocomplete="off">
      </div>

      <div class="preset-pills">
        <span class="preset-label">Quick Presets:</span>
        <button type="button" class="preset-pill" onclick="document.querySelector('#url').value='localhost:3000'">localhost:3000</button>
        <button type="button" class="preset-pill" onclick="document.querySelector('#url').value='127.0.0.1:3000'">127.0.0.1:3000</button>
        <button type="button" class="preset-pill" onclick="document.querySelector('#url').value='localhost:8080'">localhost:8080</button>
      </div>

      <button type="submit" class="connector-btn">
        <span>Connect Gateway</span>
        <span class="btn-arrow">→</span>
      </button>
    </form>

    <div class="connector-footer">
      <div class="connector-tip">
        <span class="tip-icon">ℹ️</span>
        <span>Ensure your overlay server is active. The controller will automatically negotiate API tokens and event listeners upon connecting.</span>
      </div>
    </div>
  </div>
</div>`;

  const form = document.querySelector("#connector");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.querySelector("#url");
      const ip = input ? input.value : "";
      if (!ip) return;

      window.localStorage.setItem("last-ws-host", ip.trim().replace(/^ws:\/\//, ""));
      connector(ip);
    });
  }
};

window.connectRenderer = connectRenderer;
window.connector = connector;
