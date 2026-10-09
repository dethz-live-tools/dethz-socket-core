// deno-lint-ignore-file
var controllerFrame = () => {
  if (!document.querySelector('link[href*="controller.css"]')) {
    document.head.innerHTML += `<link rel="stylesheet" href="/core/src/css/controller.css">`;
  }

  const ttIsHidden = window.localStorage.getItem("tt-hide") === "true";
  const ttsIsHidden = window.localStorage.getItem("tts-hide") !== "false";
  const logIsHidden = window.localStorage.getItem("log-hide") === "true";

  const element = `<div class="main-container">
  <aside id="status">
    <div class="status-brand">
      <div class="brand-logo">
        <span class="brand-icon">⚡</span>
        <div class="brand-text">
          <span class="brand-title">STREAM HUB</span>
          <span class="brand-subtitle">Overlay Controller</span>
        </div>
      </div>
      <div class="brand-meta">
        <span class="brand-version" id="core-version">v1.0.1</span>
        <button type="button" class="brand-update-badge hidden" id="brand-update-badge" title="New core version available">NEW</button>
      </div>
    </div>

    <div class="status-container">
      <div class="sidebar-section-title">CONNECTIONS</div>

      <!-- Socket Status Tile -->
      <div class="status-tile" id="socket">
        <div class="status-tile-header">
          <div class="status-tile-title">
            <span class="tile-icon">🌐</span>
            <span>WebSocket</span>
          </div>
          <span id="socket-status" class="status-indicator">🔴</span>
        </div>
        <div class="status-tile-detail">
          <span id="socket-target-ip">Gateway Channel</span>
        </div>
      </div>

      <!-- Spotify Status Tile -->
      <div class="status-tile" id="spotify">
        <div id="spotify-status-container" class="status-tile-header">
          <div class="status-tile-title">
            <span class="tile-icon">🎧</span>
            <span>Spotify API</span>
          </div>
          <span id="spotify-status" class="status-indicator">🔴</span>
        </div>
        <div id="time" class="status-tile-time hidden">
          <span class="time-label">Token Expire:</span>
          <span id="spotify-time-left" class="time-badge">0</span>s
        </div>
      </div>

      <!-- TikTok Status Tile -->
      <div class="status-tile" id="tiktok-status-wrapper">
        <div id="tiktok-status-container" class="status-tile-header">
          <div class="status-tile-title">
            <span class="tile-icon">📱</span>
            <span>TikTok Live</span>
          </div>
          <span id="tiktok-status" class="status-indicator">🔴</span>
        </div>
        <div class="status-tile-detail">
          <span id="tiktok-sidebar-user">Live Chat & Gifts</span>
        </div>
      </div>

      <!-- Core Update Status Tile -->
      <div class="status-tile" id="update-status-wrapper">
        <div id="update-status-container" class="status-tile-header">
          <div class="status-tile-title">
            <span class="tile-icon">🔄</span>
            <span>Core Update</span>
          </div>
          <span id="update-status-indicator" class="status-indicator" title="System update status">⚪</span>
        </div>
        <div class="status-tile-detail update-tile-detail">
          <span id="update-status-text">Checking for updates...</span>
          <button type="button" id="btn-check-update" class="update-check-btn" title="Check for core updates">Check</button>
        </div>
        <div id="update-action-container" class="update-action-row hidden">
          <button type="button" id="btn-apply-update" class="update-apply-btn">
            <span>Install Update</span> <span id="update-target-version"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="system-status-pill">
        <span class="pulse-dot online"></span>
        <span>Core Engine Active</span>
      </div>
    </div>
  </aside>

  <main id="controller">
    <div class="controller-container">
      <!-- Quick Socket Command & Message Card -->
      <div id="socket-controller" class="controller-card"></div>

      <!-- TikTok Live Controller Card -->
      <div id="tiktok-controller" class="controller-card">
        <div id="tiktok-header" class="card-header" role="button" tabindex="0">
          <div class="header-left">
            <span class="header-icon">📱</span>
            <div>
              <h2 class="card-title">TikTok Live & Chat</h2>
              <span class="card-desc">Real-time comments, viewer events, and combo gift tracking</span>
            </div>
          </div>
          <div class="header-right">
            <span class="collapse-chevron">▼</span>
          </div>
        </div>
        <div id="tiktok-container" class="${ttIsHidden ? "hidden" : ""}"></div>
      </div>

      <!-- Spotify Controller Card -->
      <div id="spotify-controller" class="controller-card">
        <div class="card-header" id="spt-header">
          <div class="header-left">
            <span class="header-icon">🎧</span>
            <div>
              <h2 class="card-title">Spotify Controller</h2>
              <span class="card-desc">Loading player status...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Text-to-Speech (TTS) Card -->
      <div id="tts-controller" class="controller-card">
        <div id="tts-header" class="card-header" role="button" tabindex="0">
          <div class="header-left">
            <span class="header-icon">🗣️</span>
            <div>
              <h2 class="card-title">Text-to-Speech (TTS)</h2>
              <span class="card-desc">Overlay speech engine configuration and event voicing</span>
            </div>
          </div>
          <div class="header-right">
            <span class="collapse-chevron">▼</span>
          </div>
        </div>
        <div id="tts-container" class="${ttsIsHidden ? "hidden" : ""}">
          <div class="tts-placeholder-card">
            <div class="tts-placeholder-badge">
              <span class="pulse-dot online"></span>
              <span>SYNTHESIZER STANDBY</span>
            </div>
            <p class="tts-placeholder-text">Text-to-Speech events received from the WebSocket gateway are automatically processed and voiced over stream overlays.</p>
            <div class="tts-metrics-row">
              <div class="tts-metric-item">
                <span class="metric-label">Voice Engine</span>
                <span class="metric-val">Web Speech / Socket</span>
              </div>
              <div class="tts-metric-item">
                <span class="metric-label">Auto-Pronounce</span>
                <span class="metric-val">Active</span>
              </div>
              <div class="tts-metric-item">
                <span class="metric-label">Queue Delay</span>
                <span class="metric-val">0.5s debounced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Console Logs Card -->
      <div id="log-controller" class="controller-card">
        <div id="console-header" class="card-header" role="button" tabindex="0">
          <div class="header-left">
            <span class="header-icon">💻</span>
            <div>
              <h2 class="card-title">System Console</h2>
              <span class="card-desc">Live WebSocket incoming/outgoing event stream</span>
            </div>
          </div>
          <div class="header-right">
            <span class="collapse-chevron">▼</span>
          </div>
        </div>
        <div id="console-container" class="${logIsHidden ? "hidden" : ""}">
          <div class="console-wrapper">
            <div class="console-topbar">
              <div class="console-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="console-session-name">dethz-core :: ws-events</span>
              <button id="clear-console-logs" type="button" class="console-clear-btn" title="Clear console logs">Clear Log</button>
            </div>
            <div id="log-box">
              <div class="log-empty-state" id="log-empty">
                <span>Listening for WebSocket logs and stream events...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>`;

  document.querySelector("#main").innerHTML = element;
};

var currentSpotifyFrameState = null;

var spotifyFrame = (state) => {
  if (currentSpotifyFrameState === state && document.querySelector("#spt-dash")) {
    return;
  }
  currentSpotifyFrameState = state;

  if (state) {
    document.querySelector("#spotify-controller").innerHTML =
      `<div class="card-header" id="spt-header" role="button" tabindex="0">
        <div class="header-left">
          <span class="header-icon">🎧</span>
          <div>
            <h2 class="card-title">Spotify Controller</h2>
            <span class="card-desc">Synchronize playback, current song overlay, and queue management</span>
          </div>
        </div>
        <div class="header-right">
          <span class="collapse-chevron">▼</span>
        </div>
      </div>

      <div id="spt-dash" class="spt-login-card">
        <div class="spt-login-hero">
          <div class="spt-brand-icon">🎵</div>
          <div class="spt-login-info">
            <h3>Connect Spotify Player</h3>
            <p>Authorize your Spotify account to control playback and sync the on-stream now-playing widget in real time.</p>
          </div>
          <div class="spt-login-actions">
            <button id="spt-login" class="spt-btn-primary" type="button">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              <span>Login with Spotify</span>
            </button>
            <button id="spt-reauth" class="spt-btn-secondary" type="button" title="Re-initialize if already authenticated">
              Re-Initialize Frame
            </button>
          </div>
        </div>
      </div>`;

    document.querySelector("#spt-login").addEventListener("click", async () => {
      window.location.href = "/spotify/auth/?state=" + id;
    });

    document
      .querySelector("#spt-reauth")
      .addEventListener("click", async () => {
        if (window.sessionStorage.getItem("spotify_token") !== null) {
          spotifyInit();
        } else {
          Swal.fire({
            icon: "error",
            title: "No token found",
            text: "You need to login first",
          });
        }
      });

    if (typeof spotifyAnimationFunction === "function") {
      spotifyAnimationFunction();
    }
  } else {
    const isHidden = localStorage.getItem("spt-hide") === "true";
    document.querySelector("#spotify-controller").innerHTML =
      `<div class="card-header" id="spt-header" role="button" tabindex="0">
        <div class="header-left">
          <span class="header-icon">🎧</span>
          <div>
            <h2 class="card-title">Spotify Controller</h2>
            <span class="card-desc">Playback controls, search, and live track queue</span>
          </div>
        </div>
        <div class="header-right">
          <span class="collapse-chevron">▼</span>
        </div>
      </div>

      <div id="spt-dash" class="${isHidden ? "hidden " : ""}isLogin">
        <div class="spt-button-controller">
          <div id="spt-current-play"></div>
          
          <div class="player-controller">
            <button id="spt-previous" type="button" class="spt-ctrl-btn" title="Previous Track">
              <span class="btn-icon">⏮</span>
              <span>Prev</span>
            </button>
            <button id="spt-play" type="button" class="spt-ctrl-btn spt-play-btn" title="Play or Pause">
              <span class="btn-icon">▶</span>
              <span>Play</span>
            </button> 
            <button id="spt-next" type="button" class="spt-ctrl-btn" title="Next Track">
              <span class="btn-icon">⏭</span>
              <span>Next</span>
            </button>
          </div>
          
          <div class="volume-controller">
            <button id="spt-volume-down" type="button" class="spt-vol-btn" title="Volume Down">
              <span>🔉</span>
              <span>Vol -</span>
            </button>
            <button id="spt-volume-up" type="button" class="spt-vol-btn" title="Volume Up">
              <span>🔊</span>
              <span>Vol +</span>
            </button>
          </div>
          
          <form id="spotify-search" class="spt-search-form">
            <div class="search-input-group">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search track or artist to queue..." id="context" name="context" required autocomplete="off" />
              <button type="submit" class="spt-search-btn">Queue</button>
            </div>
          </form>
          
          <div class="state-controller">
            <button id="spt-reauth" type="button" class="spt-state-btn reauth">Re-Authenticate</button>
            <button id="spt-logout" type="button" class="spt-state-btn logout">Disconnect</button>
          </div>
        </div>

        <div class="spt-queue-controller">
          <div class="spt-panel-header">
            <div class="spt-panel-title">
              <span>🎵 Live Track Queue</span>
              <span class="spt-badge" id="spt-queue-badge">0 tracks</span>
            </div>
            <button id="pull-queue" class="spt-btn-small" type="button" title="Refresh track queue">Refresh Queue</button>
          </div>
          <div id="spt-queue">
            <div class="spt-empty-state">
              <p>No tracks in queue</p>
              <span>Queue will update as songs play or when searched</span>
            </div>
          </div>
        </div>
      </div>`;

    if (!isHidden) {
      document.querySelector("#spt-dash").classList.remove("hidden");
    }

    const timeEl = document.querySelector("#time");
    if (timeEl && timeEl.classList.contains("hidden")) {
      timeEl.classList.remove("hidden");
    }

    spotifyListener();
    startTokenCountdown(token);

    if (typeof requestPlayerStatus === "function") {
      requestPlayerStatus(true);
    }
    if (typeof requestQueuePull === "function") {
      requestQueuePull();
    }
  }
};

window.controllerFrame = controllerFrame;
window.spotifyFrame = spotifyFrame;
