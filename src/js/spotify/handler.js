// deno-lint-ignore-file
var player = null;

var spotifyCommandHandler = (msg) => {
  const cmd = msg.replace(/^spt:\s*/, "");

  if (/^NEW TOKEN\s+/i.test(cmd)) {
    const rawToken = cmd.replace(/^NEW TOKEN\s+/i, "");
    sessionStorage.setItem("spotify_token", rawToken);
    spotifyInit();
  } else if (/^PLAYER DATA(\s*--\s*|\s+)/i.test(cmd)) {
    try {
      const rawData = cmd.replace(/^PLAYER DATA(\s*--\s*|\s+)/i, "");
      const data = JSON.parse(rawData);
      player = data;
      spotifyPlayerRenderer(data);
    } catch (err) {
      console.warn("Failed to parse Spotify player data:", err);
    }
  } else if (/^QUEUE(\s*--\s*|\s+)/i.test(cmd)) {
    try {
      const rawData = cmd.replace(/^QUEUE(\s*--\s*|\s+)/i, "");
      const data = JSON.parse(rawData);
      spotifyQueueRenderer(data);
    } catch (err) {
      console.warn("Failed to parse Spotify queue data:", err);
    }
  } else {
    // Other server messages / acknowledgements (do not trigger spotifyInit)
    console.log("Spotify message:", cmd);
  }
};

window.spotifyCommandHandler = spotifyCommandHandler;
