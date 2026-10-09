# Stream Overlay Socket - Core Client

A lightweight, modern web client and dashboard controller for managing live stream overlays in real time via WebSockets. Built with vanilla JavaScript, modular UI component renderers, and styled with a sleek Catppuccin-inspired dark theme.

---

## 🌟 Key Features

- **🔌 WebSocket Core Engine**
  - Flexible WebSocket connection management (`ws://<host>/ws`).
  - Real-time connection status monitoring (🟢 Online / 🔴 Offline).
  - Automatic reconnection handling, graceful teardown, and direct raw payload dispatching.
  - Staggered handshake sequence preventing race conditions during session registration.

- **🎵 Spotify Stream Controller & Queue Management**
  - Full OAuth 2.0 PKCE / backend callback authentication pipeline.
  - **Live Player Status**: Real-time track name, artist credits, album artwork, active Connect device (`💻 Device Name (ID)`), volume level, and repeat/shuffle states.
  - **Graceful Idle State**: Clear empty/stopped state display with manual "Refresh Player" trigger.
  - **Playback Controls**: Instant toggle for Play/Pause, Next Track, Previous Track, Volume Up, and Volume Down.
  - **Live Track Queue**: Dedicated upcoming queue panel rendering up to 10 upcoming tracks with indexed badges (`#1`, `#2`), album art thumbnails, track titles, and artist credits.
  - **Instant Queue Pulling**: Dedicated "Refresh Queue" action with live `Pulling...` visual feedback and auto-pull triggers on track transitions.
  - **Search & Enqueue**: Integrated search bar (`spt: search -- <query>`) allowing streamers to queue songs on the fly.
  - **Flicker-Free DOM Updates**: Targeted element mutations preventing image reload flashes or CSS transition lag on player updates.
  - **Token Management**: Live token expiration countdown timer with SweetAlert2 expiration alerts.

- **💬 TikTok Live Chat & Gift Feed Bot**
  - **One-Click Live Connect**: Connect to any TikTok creator's live stream via username (`tt: connect to <username>`).
  - **Real-Time Live Chat Log**: Live chat stream with viewer avatars, nicknames, `@uniqueId` tags, and role badges (👑 Creator/Admin, ⭐ Subscriber, 💖 Follower, 🎖️ Fanclub).
  - **Smart Gift Feed (Combo-End Only)**:
    - Automatically suppresses intermediate combo streak spam (e.g., individual taps during a 50x Rose streak).
    - Alerts only trigger once the combo concludes, displaying final aggregated repeat count (`x50`) and calculated diamond value (`💎`).
  - **Multi-Tier Gift Deduplication**:
    - Deduplicates identical gift alerts across packet replays and Webcast batch overlaps using `groupId`, `msgId`, and a rolling signature timestamp window.
  - **Live Stream Statistics**: Live status bar tracking total chat messages, gifts received, and cumulative diamonds (`💎`).
  - **Chat Controls**: Toggleable auto-scrolling and one-click chat history clearing.

- **🗣️ Text-to-Speech (TTS) Configuration**
  - Toggleable configuration module for streaming Text-to-Speech events.

- **📋 Live Event Console Log**
  - Real-time system status logger supporting `success` and `error` streams with timestamping.
  - Collapsible panels with user preference persistence (`localStorage`).

---

## 📁 Repository Structure

```
core/
├── controller/
│   └── index.html             # Main dashboard controller view
├── spotify/
│   ├── auth/index.html        # Spotify login redirect handler
│   ├── callback/index.html    # Spotify OAuth callback parser
│   └── session/index.html     # Spotify session token handler
└── src/
    ├── css/
    │   ├── connector.css      # WebSocket host entry screen styles
    │   ├── controller.css     # Dashboard layout & control panel styling (Catppuccin theme)
    │   ├── main.css           # Global typography & reset rules
    │   └── libs/
    │       └── colors.css     # Catppuccin color scheme variables
    └── js/
        ├── main.js            # Main entry point & view router
        ├── socket.js          # WebSocket client & event dispatcher
        ├── animation.js       # Panel collapsibility & toggle state persistence
        ├── console/
        │   ├── controller.js  # Console state renderer
        │   └── handler.js     # Log entry parser & formatter
        ├── renderer/
        │   ├── connector.js   # Host IP connector form UI renderer
        │   ├── socket.js      # WebSocket action buttons & status renderer
        │   ├── spotify.js     # Spotify player & track queue UI renderer
        │   ├── tiktok.js      # TikTok chat log bot, gift feed & stats renderer
        │   └── controller/
        │       └── frame.js   # Main dashboard layout frame renderer
        ├── spotify/
        │   ├── auth.js        # OAuth callback exchange handler
        │   ├── handler.js     # Spotify socket command parser
        │   └── listener.js    # Spotify UI button event listeners & queue trigger
        └── tiktok/
            ├── controller.js  # TikTok state, counters & listener manager
            └── handler.js     # TikTok socket command parser
```

---

## 📡 WebSocket Protocol Specifications

The core client communicates with the overlay backend using structured string commands sent over WebSockets (`ws://<host>/ws`).

### 🎵 Spotify Protocol (`spt:`)

| Direction | Command / Message | Description |
| :--- | :--- | :--- |
| **Client → Server** | `spt: SET TOKEN <token_json>` | Send cached OAuth session token on connection |
| **Client → Server** | `spt: player -- player` | Request current media player playback status |
| **Client → Server** | `spt: player -- <action>` | Dispatch playback actions (`play`, `play: <device_id>`, `pause`, `previous`, `next`, `volume:up`, `volume:down`) |
| **Client → Server** | `spt: search -- <query>` | Search track/artist context to add to playback |
| **Client → Server** | `spt: pulling` | Fetch upcoming track queue |
| **Client → Server** | `spt: logout` | Terminate active Spotify session |
| **Server → Client** | `spt: NEW TOKEN <token_json>` | Emitted when token has been refreshed by the server |
| **Server → Client** | `spt: PLAYER DATA -- <json>` | Current playback status payload |
| **Server → Client** | `spt: QUEUE <json>` | Live track queue payload (array or `{ queue: [...] }`) |

### 💬 TikTok Protocol (`tt:`)

| Direction | Command / Message | Description |
| :--- | :--- | :--- |
| **Client → Server** | `tt: connect to <username>` | Connect backend listener to specified TikTok username |
| **Client → Server** | `tt: disconnect` | Disconnect TikTok live stream listener |
| **Server → Client** | `tt: connected` | Confirms successful connection to TikTok live room |
| **Server → Client** | `tt: disconnected` | Confirms disconnected state |
| **Server → Client** | `tt: chat <json_data>` | Incoming live chat message payload (user, badges, comment) |
| **Server → Client** | `tt: gift <json_data>` | Finalized gift event payload (combo-end aggregated or non-streak gift) |

### 📋 Console & Logging (`log:`)

| Direction | Command / Message | Description |
| :--- | :--- | :--- |
| **Server → Client** | `log: success -- <message>` | Log successful backend operation |
| **Server → Client** | `log: error -- <message>` | Log backend error or failure message |

---

## 🚀 Getting Started

### Prerequisites
- Any static HTTP file server (e.g., `npx serve`, Deno `file_server`, Live Server, Python `http.server`).
- A running `stream-overlay-socket` backend server.

### Running the Client

1. **Serve the repository root**:
   ```bash
   npx serve .
   ```

2. **Access the Controller**:
   - Open your browser at `http://localhost:3000/controller/`.
   - Enter your WebSocket backend host address (e.g., `localhost:3000` or `127.0.0.1:3000`) when prompted.
   - Alternatively, pass the Base64-encoded backend URL directly via query parameter:
     `http://localhost:3000/controller/?id=<base64_encoded_ws_url>`

---

## 🎨 Design & External Libraries

- **Typography**: [IBM Plex Sans Thai](https://fonts.google.com/specimen/IBM+Plex+Sans+Thai) via Google Fonts.
- **Color Scheme**: [Catppuccin Macchiato](https://github.com/catppuccin/catppuccin) Dark Theme Palette.
- **Alert Modals**: [SweetAlert2](https://sweetalert2.github.io/).
