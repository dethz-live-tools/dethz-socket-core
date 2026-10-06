// deno-lint-ignore-file
var tiktokState = {
  connected: false,
  autoScroll: true,
  chatCount: 0,
  giftCount: 0,
  diamondCount: 0,
};

var updateTikTokStatsUI = () => {
  const chatCountEl = document.querySelector("#tt-chat-count");
  const chatBadgeEl = document.querySelector("#tt-chat-badge");
  const giftCountEl = document.querySelector("#tt-gift-count");
  const giftBadgeEl = document.querySelector("#tt-gift-badge");
  const diamondCountEl = document.querySelector("#tt-diamond-count");

  if (chatCountEl) chatCountEl.innerText = tiktokState.chatCount;
  if (chatBadgeEl)
    chatBadgeEl.innerText = `${tiktokState.chatCount} message${tiktokState.chatCount === 1 ? "" : "s"}`;
  if (giftCountEl) giftCountEl.innerText = tiktokState.giftCount;
  if (giftBadgeEl)
    giftBadgeEl.innerText = `${tiktokState.giftCount} gift${tiktokState.giftCount === 1 ? "" : "s"}`;
  if (diamondCountEl) diamondCountEl.innerText = tiktokState.diamondCount;
};

var resetTikTokStats = () => {
  tiktokState.chatCount = 0;
  tiktokState.giftCount = 0;
  tiktokState.diamondCount = 0;
  updateTikTokStatsUI();
};

var setupTikTokListeners = () => {
  const disconnectBtn = document.querySelector("#tt-disconnect");
  if (disconnectBtn) {
    disconnectBtn.onclick = () => {
      if (typeof ws !== "undefined" && ws.readyState === WebSocket.OPEN) {
        ws.send("tt: disconnect");
      }
    };
  }

  const autoScrollToggle = document.querySelector("#tt-autoscroll");
  if (autoScrollToggle) {
    autoScrollToggle.checked = tiktokState.autoScroll;
    autoScrollToggle.onchange = (e) => {
      tiktokState.autoScroll = e.target.checked;
    };
  }

  const clearChatBtn = document.querySelector("#tt-clear-chat");
  if (clearChatBtn) {
    clearChatBtn.onclick = () => {
      const chatbox = document.querySelector("#tt-chatbox");
      if (chatbox) {
        chatbox.innerHTML = `<div class="tt-empty-state" id="tt-chat-empty">
          <p>No chat messages yet...</p>
          <span>Comments from the live stream will appear here in real time.</span>
        </div>`;
      }
      tiktokState.chatCount = 0;
      updateTikTokStatsUI();
    };
  }

  const clearGiftsBtn = document.querySelector("#tt-clear-gifts");
  if (clearGiftsBtn) {
    clearGiftsBtn.onclick = () => {
      const giftbox = document.querySelector("#tt-giftbox");
      if (giftbox) {
        giftbox.innerHTML = `<div class="tt-empty-state" id="tt-gift-empty">
          <p>No gifts received yet...</p>
          <span>Gifts and donations from viewers will be logged here.</span>
        </div>`;
      }
      tiktokState.giftCount = 0;
      tiktokState.diamondCount = 0;
      updateTikTokStatsUI();
    };
  }
};

var tiktokController = (isOnline) => {
  tiktokState.connected = isOnline;

  const statusEl = document.querySelector("#tiktok-status");
  if (statusEl) {
    statusEl.innerHTML = isOnline ? "🟢" : "🔴";
  }

  if (isOnline) {
    const container = document.querySelector("#tiktok-container");
    if (container && container.classList.contains("hidden")) {
      container.classList.remove("hidden");
      localStorage.setItem("tt-hide", "false");
    }
    setupTikTokListeners();
    updateTikTokStatsUI();
  }
};

window.tiktokState = tiktokState;
window.updateTikTokStatsUI = updateTikTokStatsUI;
window.resetTikTokStats = resetTikTokStats;
window.setupTikTokListeners = setupTikTokListeners;
window.tiktokController = tiktokController;
