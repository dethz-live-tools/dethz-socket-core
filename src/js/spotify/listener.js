// deno-lint-ignore-file
var playerActionTimeout = null;

var playerController = (state) => {
  if (typeof ws !== "undefined" && ws.readyState === WebSocket.OPEN) {
    ws.send(`spt: player -- ${state}`);

    // Debounce player status refresh so Spotify backend has time to apply the state change
    if (playerActionTimeout !== null) {
      clearTimeout(playerActionTimeout);
    }
    playerActionTimeout = setTimeout(() => {
      if (typeof requestPlayerStatus === "function") {
        requestPlayerStatus(true);
      } else if (typeof ws !== "undefined" && ws.readyState === WebSocket.OPEN) {
        ws.send("spt: player -- player");
      }
      playerActionTimeout = null;
    }, 450);
  }
};

var spotifyListener = () => {
  const buttonList = [
    "#spt-previous",
    "#spt-next",
    "#spt-volume-down",
    "#spt-volume-up",
  ];

  for (let i = 0; i < buttonList.length; i++) {
    const btn = document.querySelector(buttonList[i]);
    if (!btn) continue;

    btn.onclick = () => {
      const slug = buttonList[i].replace("#spt-", "");

      if (slug === "volume-up" || slug === "volume-down") {
        playerController(slug.replace("-", ":"));
      } else {
        playerController(slug);
      }
    };
  }

  // Play/Pause button handler (bound once here with .onclick)
  const playBtn = document.querySelector("#spt-play");
  if (playBtn) {
    playBtn.onclick = () => {
      const isCurrentlyPlaying = window.lastPlaybackState ? window.lastPlaybackState.isPlaying : false;
      const activeDevId = window.lastPlaybackState?.deviceId || window.did;

      if (isCurrentlyPlaying) {
        playBtn.innerHTML = "Play";
        playerController("pause");
      } else {
        playBtn.innerHTML = "Pause";
        playerController(activeDevId ? "play: " + activeDevId : "play");
      }
    };
  }

  const logoutBtn = document.querySelector("#spt-logout");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      stopTokenCountdown();
      if (typeof ws !== "undefined" && ws.readyState === WebSocket.OPEN) {
        ws.send("spt: logout");
      }
    };
  }

  const reauthBtn = document.querySelector("#spt-reauth");
  if (reauthBtn) {
    reauthBtn.onclick = () => {
      document.location.href = "/spotify/auth/?state=" + id;
    };
  }

  const pullQueueBtn = document.querySelector("#pull-queue");
  if (pullQueueBtn) {
    pullQueueBtn.onclick = () => {
      if (typeof requestQueuePull === "function") {
        requestQueuePull(true);
      } else {
        const socket = typeof ws !== "undefined" && ws ? ws : (typeof window !== "undefined" && window.ws ? window.ws : null);
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send("spt: pulling");
        }
      }

      // Quick visual feedback
      const originalText = pullQueueBtn.innerText;
      pullQueueBtn.innerText = "Pulling...";
      setTimeout(() => {
        if (pullQueueBtn) pullQueueBtn.innerText = originalText;
      }, 600);
    };
  }

  const searchForm = document.querySelector("#spotify-search");
  if (searchForm) {
    searchForm.onsubmit = (e) => {
      e.preventDefault();
      const contextEl = document.querySelector("#context");
      const context = contextEl ? contextEl.value.trim() : "";

      if (context && typeof ws !== "undefined" && ws.readyState === WebSocket.OPEN) {
        ws.send(`spt: search -- ${context}`);
        // Pull queue slightly after search command is processed
        setTimeout(() => {
          if (typeof requestQueuePull === "function") {
            requestQueuePull();
          } else {
            ws.send("spt: pulling");
          }
        }, 350);
      }
    };
  }

  spotifyAnimationFunction();
};

window.playerController = playerController;
window.spotifyListener = spotifyListener;
