// deno-lint-ignore-file
var tiktokHandler = (msg) => {
  const command = msg.replace(/^tt:\s*/, "");

  if (command === "connected" || command === "disconnected") {
    const isConnected = command === "connected";
    tiktokInitialElement(isConnected);
    if (typeof tiktokController === "function") {
      tiktokController(isConnected);
    }
  } else if (command.startsWith("chat ")) {
    const rawData = command.replace(/^chat\s+/, "");
    try {
      const data = JSON.parse(rawData);
      tiktokChatRenderer(data);
    } catch (err) {
      console.warn("Error parsing TikTok chat JSON, using raw message:", err);
      tiktokChatRenderer({ comment: rawData });
    }
  } else if (command.startsWith("gift ")) {
    const rawData = command.replace(/^gift\s+/, "");
    try {
      const data = JSON.parse(rawData);
      tiktokGiftRenderer(data);
    } catch (err) {
      console.warn("Error parsing TikTok gift JSON, using raw message:", err);
      tiktokGiftRenderer({ giftName: rawData });
    }
  } else if (command.startsWith("error -- ")) {
    const errText = command.replace("error -- ", "");
    if (typeof logHandler === "function") {
      logHandler(`log: error -- TikTok: ${errText}`);
    }
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "TikTok Error",
        text: errText,
      });
    }
  } else {
    console.log("Unhandled TikTok message:", msg);
  }
};

window.tiktokHandler = tiktokHandler;
