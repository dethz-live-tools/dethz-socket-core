// deno-lint-ignore-file
var token = null;
var spt_timeout = null;
var did = null;
var lastPlaybackState = { isPlaying: false, deviceId: null };
var lastRenderedQueueIds = "";
var lastPlayerRequestTime = 0;
var lastQueuePullTime = 0;

var getActiveSocket = () => {
  if (typeof ws !== "undefined" && ws) return ws;
  if (typeof window !== "undefined" && window.ws) return window.ws;
  return null;
};

var requestPlayerStatus = (force = false) => {
  const now = Date.now();
  if (!force && now - lastPlayerRequestTime < 800) {
    return;
  }
  lastPlayerRequestTime = now;
  const socket = getActiveSocket();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send("spt: player -- player");
  }
};

var requestQueuePull = (force = false) => {
  const now = Date.now();
  if (!force && now - lastQueuePullTime < 800) {
    return;
  }
  lastQueuePullTime = now;
  const socket = getActiveSocket();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send("spt: pulling");
  }
};

var spotifyRenderer = (state) => {
  const statusEl = document.querySelector("#spotify-status");
  if (statusEl) {
    statusEl.innerHTML = state ? "🔴" : "🟢";
  }

  spotifyFrame(state);
};

var spotifyInit = () => {
  let parsedToken = null;
  try {
    parsedToken = JSON.parse(window.sessionStorage.getItem("spotify_token"));
  } catch (err) {
    console.warn("Error parsing stored spotify_token:", err);
  }

  if (parsedToken !== null) {
    if (parsedToken.error === undefined || parsedToken.error === null) {
      token = parsedToken;
    }
  }

  spotifyRenderer(token === null);

  // When initialized with a valid token, pull initial status and queue
  if (token !== null) {
    setTimeout(() => {
      requestPlayerStatus(true);
      requestQueuePull(true);
    }, 250);
  }
};

var stopTokenCountdown = () => {
  if (spt_timeout !== null) {
    clearInterval(spt_timeout);
    spt_timeout = null;
  }
};

var startTokenCountdown = (token) => {
  if (spt_timeout !== null) {
    stopTokenCountdown();
  }

  if (!token || !token.timestamp || !token.timestamp.end) {
    return;
  }

  spt_timeout = setInterval(() => {
    const now = new Date().getTime();
    const timeLeft = Math.floor((token.timestamp.end - now) / 1000);

    if (timeLeft < 0) {
      stopTokenCountdown();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "error",
          title: "Token expired",
        }).then(() => {
          token = null;
          spotifyRenderer(token === null);
        });
      } else {
        token = null;
        spotifyRenderer(token === null);
      }
      return;
    }

    const timeLeftEl = document.querySelector("#spotify-time-left");
    if (timeLeftEl) {
      timeLeftEl.innerText = timeLeft;
    }
  }, 1000);
};

var spotifyPlayerRenderer = (data) => {
  const playerElement = document.querySelector("#spt-current-play");
  const playElement = document.querySelector("#spt-play");

  if (!playerElement) return;

  // Handle null / idle / stopped playback state gracefully
  if (!data || !data.item) {
    lastPlaybackState = { isPlaying: false, deviceId: data?.device?.id || did };
    window.lastPlaybackState = lastPlaybackState;
    if (playElement) playElement.innerHTML = "▶ Play";

    const currentStatus = document.querySelector("#spt-player-status");
    if (!currentStatus || !currentStatus.classList.contains("idle")) {
      playerElement.innerHTML = `<div id="spt-player-status" class="idle">
        <div style="display:flex;flex-direction:column;align-items:center;padding:1.5rem 0.5rem;color:var(--ctp-subtext-0);text-align:center;gap:0.5rem;">
          <span style="font-size:2rem;">🎵</span>
          <p style="margin:0;font-weight:600;font-size:14px;color:var(--ctp-text);">No Active Playback</p>
          <span style="font-size:12px;color:var(--ctp-overlay-1);">Play a song on any Spotify app or Connect device</span>
        </div>
        <button id="spt-refresh-player" style="margin-top:0.5rem;width:100%;">Refresh Player</button>
      </div>`;

      const refreshBtn = document.querySelector("#spt-refresh-player");
      if (refreshBtn) {
        refreshBtn.onclick = () => requestPlayerStatus(true);
      }
    }
    return;
  }

  // Extract playback details
  const device = data.device || {};
  const id = device.id || did;
  if (device.id) {
    did = device.id;
    window.did = did;
  }

  const deviceName = device.name || "Unknown Device";
  const songName = data.item.name || "Unknown Track";
  const artists = (data.item.artists || []).map((a) => a.name).join(", ") || "Unknown Artist";
  const albumImages = data.item.album?.images || [];
  const albumArt = albumImages.length > 0 ? albumImages[0].url : "";
  const isPlaying = Boolean(data.is_playing || data.actions?.disallows?.resuming === true);
  const shuffleState = data.shuffle_state ?? false;
  const repeatState = data.repeat_state ?? "off";
  const volumePercent = device.volume_percent ?? 0;

  // Auto-pull queue if currently playing track has changed
  if (songName && lastPlaybackState.songName && songName !== lastPlaybackState.songName) {
    setTimeout(() => {
      requestQueuePull(true);
    }, 600);
  }

  lastPlaybackState = {
    isPlaying: isPlaying,
    deviceId: id,
    songName: songName,
    artists: artists,
    albumArt: albumArt,
  };
  window.lastPlaybackState = lastPlaybackState;

  // Update play/pause button label
  if (playElement) {
    playElement.innerHTML = isPlaying ? "⏸ Pause" : "▶ Play";
  }

  // Targeted DOM update to avoid re-creating nodes, flashing images, or triggering CSS transitions
  const existingStatus = document.querySelector("#spt-player-status");
  if (existingStatus && !existingStatus.classList.contains("idle")) {
    const coverImg = document.querySelector("#cover-img");
    if (coverImg && albumArt && coverImg.getAttribute("data-src") !== albumArt) {
      coverImg.src = albumArt;
      coverImg.setAttribute("data-src", albumArt);
    }

    const songNameEl = document.querySelector("#song-name");
    if (songNameEl && songNameEl.textContent !== songName) {
      songNameEl.textContent = songName;
    }

    const artistNameEl = document.querySelector("#artist-name");
    if (artistNameEl && artistNameEl.textContent !== artists) {
      artistNameEl.textContent = artists;
    }

    const currentPlayerEl = document.querySelector("#current-player");
    const deviceStr = `💻 ${deviceName} (${id || "N/A"})`;
    if (currentPlayerEl && currentPlayerEl.textContent.trim() !== deviceStr) {
      currentPlayerEl.textContent = deviceStr;
    }

    const playerStateEl = document.querySelector("#player-state");
    if (playerStateEl) {
      const stateStr = `<p>shuffle: ${shuffleState ? "on" : "off"}</p><p>repeat: ${repeatState}</p><p>volume: ${volumePercent}%</p>`;
      if (playerStateEl.innerHTML !== stateStr) {
        playerStateEl.innerHTML = stateStr;
      }
    }
  } else {
    // Initial build of player status container
    const element = `<div id="spt-player-status">
  <div id="current-play">
    <img src="${albumArt}" alt="cover-img" id="cover-img" data-src="${albumArt}">
    <div id="current-play-text">
      <div id="song-name">${songName}</div>
      <div id="artist-name">${artists}</div>
    </div>
  </div>
  
  <hr>

  <div id="device">
    <p id="current-player">
      💻 ${deviceName} (${id || "N/A"})
    </p>
  </div>

  <hr>
 
  <div id="player-state">
    <p>shuffle: ${shuffleState ? "on" : "off"}</p>
    <p>repeat: ${repeatState}</p>
    <p>volume: ${volumePercent}%</p>
  </div>

  <button id="spt-refresh-player" type="button">
    🔄 Refresh Player
  </button>
</div>`;

    playerElement.innerHTML = element;

    const refreshBtn = document.querySelector("#spt-refresh-player");
    if (refreshBtn) {
      refreshBtn.onclick = () => {
        requestPlayerStatus(true);
      };
    }
  }
};

var escapeHtmlLocal = (text) => {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

var spotifyQueueRenderer = (data) => {
  const queueElement = document.querySelector("#spt-queue");
  if (!queueElement) return;

  // Extract queue list from various possible Spotify response shapes:
  let queue = [];
  if (Array.isArray(data)) {
    queue = data;
  } else if (Array.isArray(data?.queue)) {
    queue = data.queue;
  } else if (Array.isArray(data?.tracks)) {
    queue = data.tracks;
  } else if (Array.isArray(data?.items)) {
    queue = data.items;
  } else if (Array.isArray(data?.data)) {
    queue = data.data;
  }

  // Update badge count
  const queueBadge = document.querySelector("#spt-queue-badge");
  if (queueBadge) {
    queueBadge.innerText = `${queue.length} track${queue.length === 1 ? "" : "s"}`;
  }

  if (queue.length === 0) {
    queueElement.innerHTML = `<div class="spt-empty-state">
      <p>No tracks in queue</p>
      <span>Queue will update as songs play or when searched</span>
    </div>`;
    lastRenderedQueueIds = "";
    return;
  }

  // Render up to 10 queue tracks
  const items = queue.slice(0, 10);
  const currentIds = items.map((p) => p?.id || p?.name || "").join(",");

  if (
    currentIds === lastRenderedQueueIds &&
    queueElement.children.length === items.length
  ) {
    return;
  }
  lastRenderedQueueIds = currentIds;

  let queueItem = "";
  for (let i = 0; i < items.length; i++) {
    const payload = items[i];
    if (!payload) continue;

    const trackName = escapeHtmlLocal(payload.name || "Unknown Track");
    const artist = escapeHtmlLocal(
      (payload.artists || []).map((a) => a.name).join(", ") || "Unknown Artist"
    );
    const albumImages = payload.album?.images || [];
    const albumArt = albumImages.length > 0 ? albumImages[0].url : "";
    const id = payload.id || `queue-${i}`;

    queueItem += `
    <div class="queue-item" id="${id}">
      <span class="queue-index">#${i + 1}</span>
      ${albumArt ? `<img src="${albumArt}" alt="cover-img" class="queue-art" onerror="this.style.display='none';">` : `<div style="width:2.5rem;height:2.5rem;background:var(--ctp-surface-1);border-radius:0.35rem;flex-shrink:0;"></div>`}

      <div class="track-text">
        <p class="track-name">${trackName}</p>
        <p class="track-artist">${artist}</p>
      </div>
    </div>`;
  }

  queueElement.innerHTML = queueItem;
};

window.token = token;
window.did = did;
window.lastPlaybackState = lastPlaybackState;
window.requestPlayerStatus = requestPlayerStatus;
window.requestQueuePull = requestQueuePull;
window.spotifyRenderer = spotifyRenderer;
window.spotifyInit = spotifyInit;
window.stopTokenCountdown = stopTokenCountdown;
window.startTokenCountdown = startTokenCountdown;
window.spotifyPlayerRenderer = spotifyPlayerRenderer;
window.spotifyQueueRenderer = spotifyQueueRenderer;
