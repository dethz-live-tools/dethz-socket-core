// deno-lint-ignore-file
var DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a5adcb'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

var escapeHtml = (text) => {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

var tiktokInitialElement = (isLogin) => {
  const container = document.querySelector("#tiktok-container");
  if (!container) return;

  if (!isLogin) {
    const savedUser = window.localStorage.getItem("tt-username") || "";
    container.innerHTML = `<form id="tiktok-connect">
  <input id="tt-username" placeholder="TikTok Username (e.g. username)" value="${escapeHtml(savedUser)}" required />
  <button type="submit">Connect</button>
</form>`;

    const statusEl = document.querySelector("#tiktok-status");
    if (statusEl) statusEl.innerHTML = "🔴";

    const connectForm = document.querySelector("#tiktok-connect");
    if (connectForm) {
      connectForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const usernameInput = document.querySelector("#tt-username");
        const username = usernameInput
          ? usernameInput.value.trim().replace(/^@/, "")
          : "";
        if (!username) return;

        window.localStorage.setItem("tt-username", username);
        if (typeof ws !== "undefined" && ws.readyState === WebSocket.OPEN) {
          ws.send(`tt: connect to ${username}`);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Socket Offline",
            text: "WebSocket is not connected to server.",
          });
        }
      });
    }
  } else {
    const username =
      window.localStorage.getItem("tt-username") || "Connected User";

    container.innerHTML = `<div id="current-connect">
  <div class="tt-conn-info">
    <span class="tt-conn-badge">● LIVE</span>
    <span class="tt-conn-text">Connected to <strong id="tt-target-user">@${escapeHtml(username)}</strong></span>
  </div>
  <div class="tt-stats-bar">
    <div class="tt-stat-item" title="Total Chat Messages">
      <span class="tt-stat-label">💬 Chats</span>
      <span class="tt-stat-value" id="tt-chat-count">${window.tiktokState ? window.tiktokState.chatCount : 0}</span>
    </div>
    <div class="tt-stat-item" title="Total Gifts Received">
      <span class="tt-stat-label">🎁 Gifts</span>
      <span class="tt-stat-value" id="tt-gift-count">${window.tiktokState ? window.tiktokState.giftCount : 0}</span>
    </div>
    <div class="tt-stat-item" title="Total Diamonds Value">
      <span class="tt-stat-label">💎 Diamonds</span>
      <span class="tt-stat-value" id="tt-diamond-count">${window.tiktokState ? window.tiktokState.diamondCount : 0}</span>
    </div>
  </div>
  <button id="tt-disconnect" type="button">Disconnect</button>
</div>

<div id="tt-dash">
  <!-- Live Chat Container -->
  <div id="tt-chat-container">
    <div class="tt-panel-header">
      <div class="tt-panel-title">
        <span>💬 Live Chat</span>
        <span class="tt-badge" id="tt-chat-badge">${window.tiktokState ? window.tiktokState.chatCount : 0} messages</span>
      </div>
      <div class="tt-panel-controls">
        <label class="tt-toggle-label" title="Toggle automatic scrolling">
          <input type="checkbox" id="tt-autoscroll" ${window.tiktokState && window.tiktokState.autoScroll === false ? "" : "checked"}>
          <span>Auto-scroll</span>
        </label>
        <button id="tt-clear-chat" type="button" class="tt-btn-small" title="Clear chat feed">Clear</button>
      </div>
    </div>
    <div id="tt-chatbox" class="tt-scrollbox">
      <div class="tt-empty-state" id="tt-chat-empty">
        <p>No chat messages yet...</p>
        <span>Comments from the live stream will appear here in real time.</span>
      </div>
    </div>
  </div>

  <!-- Live Gift Container -->
  <div id="tt-gift-container">
    <div class="tt-panel-header">
      <div class="tt-panel-title">
        <span>🎁 Gift Logs</span>
        <span class="tt-badge" id="tt-gift-badge">${window.tiktokState ? window.tiktokState.giftCount : 0} gifts</span>
      </div>
      <div class="tt-panel-controls">
        <button id="tt-clear-gifts" type="button" class="tt-btn-small" title="Clear gift logs">Clear</button>
      </div>
    </div>
    <div id="tt-giftbox" class="tt-scrollbox">
      <div class="tt-empty-state" id="tt-gift-empty">
        <p>No gifts received yet...</p>
        <span>Gifts and donations from viewers will appear here in real time.</span>
      </div>
    </div>
  </div>
</div>`;

    if (typeof tiktokController === "function") {
      tiktokController(true);
    }
  }
};

var tiktokChatRenderer = (data) => {
  if (!data) return;

  const chatbox = document.querySelector("#tt-chatbox");
  if (!chatbox) return;

  // Remove empty placeholder
  const emptyState = document.querySelector("#tt-chat-empty");
  if (emptyState) emptyState.remove();

  // Normalize data fields
  const nickname =
    `${data.user.nickname || "Viewer"} [@${data.user.uniqueId || ""}]` ||
    "Viewer";
  const uniqueId = data.user.uniqueId || "";
  const comment = data.comment || data.message || data.text || "";
  const avatar = data.user.profile || "";
  const createTime = data.createTime || data.timestamp || Date.now();
  const timeStr = new Date(
    Number(createTime) || Date.now(),
  ).toLocaleTimeString();

  // Badges
  let badgesHtml = "";
  if (data.isModerator) {
    badgesHtml += `<span class="tt-badge-role tt-badge-mod" title="Moderator">MOD</span>`;
  }
  if (data.isSubscriber) {
    badgesHtml += `<span class="tt-badge-role tt-badge-sub" title="Subscriber">SUB</span>`;
  }
  if (data.followRole === 2) {
    badgesHtml += `<span class="tt-badge-role tt-badge-friend" title="Friend">FRIEND</span>`;
  } else if (data.followRole === 1) {
    badgesHtml += `<span class="tt-badge-role tt-badge-follower" title="Follower">FOLLOWER</span>`;
  }
  if (data.topGifterRank) {
    badgesHtml += `<span class="tt-badge-role tt-badge-gifter" title="Top Gifter">👑 #${data.topGifterRank}</span>`;
  }

  const escapedNick = escapeHtml(nickname);
  const escapedUniqueId = escapeHtml(uniqueId);
  const escapedComment = escapeHtml(comment);
  const avatarSrc = avatar ? escapeHtml(avatar) : DEFAULT_AVATAR;

  const item = document.createElement("div");
  item.className = "tt-chat-item";
  item.innerHTML = `<div class="tt-avatar-wrapper">
    <img src="${avatarSrc}" alt="${escapedNick}" class="tt-avatar" onerror="this.src='${DEFAULT_AVATAR}';this.onerror=null;">
  </div>
  <div class="tt-chat-body">
    <div class="tt-chat-meta">
      <span class="tt-nickname">${escapedNick}</span>
      ${uniqueId ? `<span class="tt-uniqueid">@${escapedUniqueId}</span>` : ""}
      ${badgesHtml}
      <span class="tt-time">${timeStr}</span>
    </div>
    <div class="tt-chat-content">${escapedComment}</div>
  </div>`;

  chatbox.appendChild(item);

  // Keep DOM bounded
  while (chatbox.children.length > 300) {
    chatbox.removeChild(chatbox.firstChild);
  }

  // Auto-scroll
  if (window.tiktokState && window.tiktokState.autoScroll !== false) {
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Update stats
  if (window.tiktokState) {
    window.tiktokState.chatCount++;
    if (typeof updateTikTokStatsUI === "function") {
      updateTikTokStatsUI();
    }
  }
};

var processedGiftKeys = new Set();
var recentGiftSignatures = new Map();

var tiktokGiftRenderer = (data) => {
  if (!data) return;

  // Streakable / combo gift detection:
  // In TikTok Live connector:
  // - giftType === 1 indicates a streakable/combo gift (e.g. roses)
  // - repeatEnd === true (or repeat_end === 1) indicates the combo/streak has finished
  // - If giftType === 1 and repeatEnd is falsy, the user is still actively sending the combo streak.
  const rawGiftType = data.gift?.type ?? data.giftType ?? data.type;
  const giftType =
    rawGiftType !== undefined && rawGiftType !== null
      ? Number(rawGiftType)
      : null;
  const repeatCount = Number(
    data.gift?.repeat || data.repeatCount || data.count || 1,
  );
  const isComboEnd = Boolean(
    data.repeatEnd ||
    data.repeat_end === 1 ||
    data.isRepeatEnd ||
    data.comboEnd ||
    data.gift?.repeatEnd ||
    data.gift?.repeat_end === 1,
  );

  // If streak in progress, wait until combo ends
  if (
    !isComboEnd &&
    (giftType === 1 ||
      repeatCount > 1 ||
      data.repeatEnd === false ||
      data.gift?.repeatEnd === false)
  ) {
    return;
  }

  // Deduplication check: prevent duplicate gift alerts for the same streak/message
  const user = data.user || {};
  const uniqueId =
    user.uniqueId || data.uniqueId || user.id || data.userId || "";
  const gift = data.gift || {};
  const giftName =
    gift.name || data.giftName || data.describe || data.name || "Gift";
  const giftId = gift.id || data.giftId || "";
  const groupId = data.groupId || gift.groupId || "";
  const msgId = data.msgId || data.id || "";
  const nowMs = Date.now();
  const createTime = data.createTime || data.timestamp || nowMs;

  // 1. Group / streak deduplication
  if (groupId) {
    const groupKey = `grp_${uniqueId}_${groupId}_${repeatCount}`;
    if (processedGiftKeys.has(groupKey)) {
      return;
    }
    processedGiftKeys.add(groupKey);
  } else if (msgId) {
    // 2. Message ID deduplication
    const msgKey = `msg_${msgId}`;
    if (processedGiftKeys.has(msgKey)) {
      return;
    }
    processedGiftKeys.add(msgKey);
  } else {
    // 3. Fallback signature deduplication within a 3-second window
    const signature = `${uniqueId}_${giftId || giftName}_${repeatCount}`;
    if (recentGiftSignatures.has(signature)) {
      const lastSeen = recentGiftSignatures.get(signature);
      if (nowMs - lastSeen < 3000) {
        return; // Duplicate event
      }
    }
    recentGiftSignatures.set(signature, nowMs);

    // Clean up signatures older than 10 seconds
    if (recentGiftSignatures.size > 200) {
      for (const [k, t] of recentGiftSignatures.entries()) {
        if (nowMs - t > 10000) recentGiftSignatures.delete(k);
      }
    }
  }

  // Keep processed keys bounded to 500 items
  if (processedGiftKeys.size > 500) {
    const firstKey = processedGiftKeys.values().next().value;
    if (firstKey) processedGiftKeys.delete(firstKey);
  }

  const giftbox = document.querySelector("#tt-giftbox");
  const chatbox = document.querySelector("#tt-chatbox");

  // Remove empty placeholder
  const emptyState = document.querySelector("#tt-gift-empty");
  if (emptyState) emptyState.remove();

  // Normalize user data display fields
  const rawNickname =
    user.nickname || data.nickname || (uniqueId ? uniqueId : "Viewer");
  const nickname = uniqueId ? `${rawNickname} [@${uniqueId}]` : rawNickname;
  const avatar =
    user.profile || user.profilePictureUrl || data.avatar || data.profile || "";
  const timeStr = new Date(
    Number(createTime) || Date.now(),
  ).toLocaleTimeString();

  // Normalize gift display fields
  const giftIcon = gift.image || data.giftPictureUrl || data.giftIcon || "";
  const diamondCount = Number(gift.count || data.diamondCount || 0);

  const escapedNick = escapeHtml(nickname);
  const escapedGiftName = escapeHtml(giftName);
  const avatarSrc = avatar ? escapeHtml(avatar) : DEFAULT_AVATAR;

  // Render in giftbox
  if (giftbox) {
    const giftItem = document.createElement("div");
    giftItem.className = "tt-gift-item";
    giftItem.innerHTML = `<div class="tt-avatar-wrapper">
      <img src="${avatarSrc}" alt="${escapedNick}" class="tt-avatar" onerror="this.src='${DEFAULT_AVATAR}';this.onerror=null;">
    </div>
    <div class="tt-gift-body">
      <div class="tt-gift-meta">
        <span class="tt-nickname">${escapedNick}</span>
        ${uniqueId ? `<span class="tt-uniqueid">@${escapeHtml(uniqueId)}</span>` : ""}
        <span class="tt-time">${timeStr}</span>
      </div>
      <div class="tt-gift-content">
        <span class="tt-gift-desc">sent <strong>${escapedGiftName}</strong></span>
        ${giftIcon ? `<img src="${escapeHtml(giftIcon)}" alt="${escapedGiftName}" class="tt-gift-icon" onerror="this.style.display='none';">` : `<span class="tt-gift-emoji">🎁</span>`}
        <span class="tt-gift-repeat">x${repeatCount}</span>
        ${diamondCount > 0 ? `<span class="tt-gift-diamonds">💎 ${diamondCount * repeatCount}</span>` : ""}
      </div>
    </div>`;

    giftbox.appendChild(giftItem);

    while (giftbox.children.length > 150) {
      giftbox.removeChild(giftbox.firstChild);
    }

    giftbox.scrollTop = giftbox.scrollHeight;
  }

  // Also render highlighted gift notice into chatbox if available
  if (chatbox) {
    const chatEmpty = document.querySelector("#tt-chat-empty");
    if (chatEmpty) chatEmpty.remove();

    const chatGiftItem = document.createElement("div");
    chatGiftItem.className = "tt-chat-item tt-chat-gift";
    chatGiftItem.innerHTML = `<div class="tt-avatar-wrapper">
      <img src="${avatarSrc}" alt="${escapedNick}" class="tt-avatar" onerror="this.src='${DEFAULT_AVATAR}';this.onerror=null;">
    </div>
    <div class="tt-chat-body">
      <div class="tt-chat-meta">
        <span class="tt-nickname">${escapedNick}</span>
        <span class="tt-badge-role tt-badge-gift">GIFT</span>
        <span class="tt-time">${timeStr}</span>
      </div>
      <div class="tt-chat-content tt-gift-highlight">
        <span>Sent <strong>${escapedGiftName}</strong></span>
        ${giftIcon ? `<img src="${escapeHtml(giftIcon)}" alt="${escapedGiftName}" class="tt-gift-icon-inline" onerror="this.style.display='none';">` : "🎁"}
        <span class="tt-gift-repeat">x${repeatCount}</span>
        ${diamondCount > 0 ? `<span class="tt-gift-diamonds">💎 ${diamondCount * repeatCount}</span>` : ""}
      </div>
    </div>`;

    chatbox.appendChild(chatGiftItem);

    while (chatbox.children.length > 300) {
      chatbox.removeChild(chatbox.firstChild);
    }

    if (window.tiktokState && window.tiktokState.autoScroll !== false) {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  }

  // Update stats
  if (window.tiktokState) {
    window.tiktokState.giftCount++;
    window.tiktokState.diamondCount += diamondCount * repeatCount;
    if (typeof updateTikTokStatsUI === "function") {
      updateTikTokStatsUI();
    }
  }
};

window.escapeHtml = escapeHtml;
window.tiktokInitialElement = tiktokInitialElement;
window.tiktokChatRenderer = tiktokChatRenderer;
window.tiktokGiftRenderer = tiktokGiftRenderer;
window.processedGiftKeys = processedGiftKeys;
