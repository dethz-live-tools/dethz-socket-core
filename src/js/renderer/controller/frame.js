// deno-lint-ignore-file
var controllerFrame = () => {
  document.head.innerHTML += `<link rel="stylesheet" href="/core/src/css/controller.css">`;

  const element = `<div class="main-container">
  <div id="status">
    <div class="status-container">
      <p id="socket">
        Socket Status: <span id="socket-status">🔴</span>
      </p>
      <p id="spotify">
        <p id="spotify-status-container">
          Spotify Status: <span id="spotify-status">🔴</span>
        </p>

        <p id="time" class="hidden">
          Time Left: <span id="spotify-time-left">0</span>
        </p>
      </p>
      <p id="tiktok-status-wrapper">
        <p id="tiktok-status-container">
          TikTok Status: <span id="tiktok-status">🔴</span>
        </p>
      </p>
    </div>
  </div>
  <div id="controller">
    <div class="controller-container">
      <div id="socket-controller">
        
      </div>

      <div id="tiktok-controller">
        <h2 id="tiktok-header">Tiktok Chat & Utilities</h2>
        <div id="tiktok-container" ${window.localStorage.getItem("tt-hide") === "false" ? 'class=""' : 'class="hidden"'}>
          
        </div>
      </div>
      
      <div id="tts-controller">
        <h2 id="tts-header">TTS Config</h2>
        <div id="tts-container" ${window.localStorage.getItem("tts-hide") === "false" ? 'class=""' : 'class="hidden"'}>
          
        </div>
      </div>
      
      <div id="spotify-controller">
        nothing to load right now
      </div>

      <div id="log-controller">
        <h2 id="console-header">Console</h2>
        <div id="console-container" ${window.localStorage.getItem("log-hide") === "false" ? 'class=""' : 'class="hidden"'}>
          <div id="log-box"></div>
        </div>
      </div>
    </div>
  </div>
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
      `<h3 id="spt-header">
  Spotify Controller
</h3>

<div id="spt-dash">
  <button id="spt-login">Login with Spotify</button>
  <div>
    <p>If you already logged in and some error occurred</p>
    <button id="spt-reauth">Re-Initialized Frame</button>
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
  } else {
    const isHidden = localStorage.getItem("spt-hide") === "true";
    document.querySelector("#spotify-controller").innerHTML =
      `<h2 id="spt-header">
  Spotify Controller
</h2>

<div id="spt-dash" class="${isHidden ? "hidden " : ""}isLogin">
  <div class="spt-button-controller">
    <div id="spt-current-play"></div>
    
    <div class="player-controller">
      <button id="spt-previous" type="button" title="Previous Track">
        ⏮ Previous
      </button>
      <button id="spt-play" type="button" title="Play or Pause">
        ▶ Play
      </button> 
      <button id="spt-next" type="button" title="Next Track">
        ⏭ Next
      </button>
    </div>
    
    <div class="volume-controller">
      <button id="spt-volume-down" type="button" title="Volume Down">🔉 Vol -</button>
      <button id="spt-volume-up" type="button" title="Volume Up">🔊 Vol +</button>
    </div>
    
    <form id="spotify-search">
      <input type="text" placeholder="Search song or artist to queue..." id="context" name="context" required />
      <button type="submit">Queue</button>
    </form>
    
    <div class="state-controller">
      <button id="spt-reauth" type="button">Re-Authenticate</button>
      <button id="spt-logout" type="button">Logout</button>
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

    const timeEl = document.querySelector("p#time");
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
