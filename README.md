# Stream Overlay Socket - Core Client

A lightweight, modern web client and dashboard controller for managing live stream overlays in real time via WebSockets. Built with vanilla JavaScript, modular UI component renderers, and styled with a Catppuccin-inspired dark theme.

---

## 🌟 Key Features

- **🔌 WebSocket Core Engine**
  - Flexible WebSocket connection management (`ws://<host>/ws`).
  - Real-time connection status monitoring (🟢 Online / 🔴 Offline).
  - Automatic reconnection handling and direct raw payload dispatching.

- **🎵 Spotify Stream Controller**
  - Full OAuth 2.0 PKCE / backend callback authentication pipeline.
  - Real-time playback status: current track name, artists, cover art, active device ID, and volume level.
  - Playback controls: Play, Pause, Next, Previous, Volume Up, Volume Down.
  - Interactive search (`spt: search -- <query>`) and track queue management.
  - Live token expiration countdown timer with alert popups.

- **💬 TikTok Live Integration**
  - Real-time connection toggle using TikTok username (`tt: connect to <username>`).
  - Dedicated containers for live stream chat feeds and gift notifications.

- **🗣️ Text-to-Speech (TTS) Configuration**
  - Toggleable configuration module for streaming Text-to-Speech events.

- **📋 Live Event Console Log**
  - Real-time status logger supporting `success` and `error` streams with timestamping.
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
    │   ├── controller.css     # Dashboard layout & control panel styling
    │   ├── main.css           # Global typography & Catppuccin theme rules
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
        │   ├── spotify.js     # Spotify player & queue UI renderer
        │   ├── tiktok.js      # TikTok UI connector & dashboard renderer
        │   └── controller/
        │       └── frame.js   # Main dashboard layout frame renderer
        ├── spotify/
        │   ├── auth.js        # OAuth callback exchange handler
        │   ├── handler.js     # Spotify socket command parser
        │   └── listener.js    # Spotify UI button event listeners
        └── tiktok/
            ├── controller.js  # TikTok state, counters & listener manager
            └── handler.js     # TikTok socket command parser
```

---

## 📡 WebSocket Protocol Specifications

The core client communicates with the overlay backend using structured string commands sent over WebSockets (`ws://<host>/ws`).

### 🎵 Spotify Protocol (`spt:`)
- **`spt: SET TOKEN <token_json>`**: Send cached OAuth session token on connection.
- **`spt: player -- player`**: Request current media player status.
- **`spt: player -- <action>`**: Dispatch playback commands:
  - `play: <device_id>` / `pause`
  - `previous` / `next`
  - `volume:up` / `volume:down`
- **`spt: search -- <query>`**: Search for track/artist context.
- **`spt: pulling`**: Fetch current track queue.
- **`spt: logout`**: Terminate active Spotify session.

### 💬 TikTok Protocol (`tt:`)
- **`tt: connect to <username>`**: Connect backend listener to specified TikTok username.
- **`tt: disconnect`**: Disconnect TikTok live chat listener.
- **`tt: chat <json_data>`**: Incoming live chat payload.
- **`tt: gift <json_data>`**: Incoming gift event payload.

### 📋 Console & Logging (`log:`)
- **`log: success -- <message>`**: Log success message.
- **`log: error -- <message>`**: Log error message.

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
   - Enter your WebSocket backend host address (e.g., `localhost:8080` or `127.0.0.1:8080`) when prompted.
   - Alternatively, pass the Base64-encoded backend URL directly via query parameter:
     `http://localhost:3000/controller/?id=<base64_encoded_ws_url>`

---

## 🎨 Design & External Libraries

- **Typography**: [IBM Plex Sans Thai](https://fonts.google.com/specimen/IBM+Plex+Sans+Thai) via Google Fonts.
- **Color Scheme**: Catppuccin Dark Theme Palette.
- **Alert Modals**: [SweetAlert2](https://sweetalert2.github.io/).
