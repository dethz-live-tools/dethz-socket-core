// ponytail: minimal vanilla DOM config controller
if (typeof mountSidebar === "function") {
  mountSidebar("config", "#sidebar-slot");
}
if (typeof initCoreUpdater === "function") {
  initCoreUpdater();
}

function escapeHtml(str) {
  if (typeof str !== "string") str = String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = (isError ? "✗ " : "✓ ") + msg;
  toast.className = "toast show" + (isError ? " error" : "");
  setTimeout(() => {
    toast.className = "toast";
  }, 4000);
}

function toggleSecretVisibility() {
  const input = document.getElementById("SPOTIFY_CLIENT_SECRET");
  const btn = document.getElementById("toggleSecretBtn");
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
}

function switchTab(tab) {
  const formCard = document.getElementById("configForm");
  const jsonCard = document.getElementById("jsonView");
  const formBtn = document.getElementById("tabFormBtn");
  const jsonBtn = document.getElementById("tabJsonBtn");

  if (tab === "form") {
    formCard.style.display = "flex";
    jsonCard.style.display = "none";
    formBtn.classList.add("active");
    jsonBtn.classList.remove("active");
  } else {
    syncFormToJson();
    formCard.style.display = "none";
    jsonCard.style.display = "flex";
    jsonBtn.classList.add("active");
    formBtn.classList.remove("active");
  }
}

function addCustomKeyRow(key = "", val = "") {
  const tbody = document.getElementById("customKeysBody");
  const tr = document.createElement("tr");
  tr.className = "custom-key-row";
  tr.innerHTML = `
    <td><input type="text" class="custom-key" placeholder="KEY_NAME" value="${escapeHtml(key)}"></td>
    <td><input type="text" class="custom-val" placeholder="value" value="${escapeHtml(typeof val === "object" ? JSON.stringify(val) : String(val))}"></td>
    <td><button type="button" class="btn btn-danger" onclick="this.closest('tr').remove()">✕</button></td>
  `;
  tbody.appendChild(tr);
}

function addExpansionVarRow(tbody, key = "", val = "") {
  const tr = document.createElement("tr");
  tr.className = "expansion-var-row";
  tr.innerHTML = `
    <td><input type="text" class="exp-var-key" placeholder="VARIABLE_NAME" value="${escapeHtml(key)}"></td>
    <td><input type="text" class="exp-var-val" placeholder="value" value="${escapeHtml(typeof val === "object" ? JSON.stringify(val) : String(val))}"></td>
    <td><button type="button" class="btn btn-danger" onclick="this.closest('tr').remove()">✕</button></td>
  `;
  tbody.appendChild(tr);
}

function createExpansionCard(folder, meta = null, vars = {}) {
  const container = document.getElementById("expansionCardsContainer");
  const card = document.createElement("div");
  card.className = "expansion-card";
  card.setAttribute("data-folder", folder);

  const isCustom = !folder;
  const folderHeader = isCustom
    ? `<input type="text" class="expansion-folder-name" placeholder="module-folder-name" value="" style="padding: 0.2rem 0.5rem; font-size: 0.9rem; min-width: 200px;">`
    : `<span>${escapeHtml(folder)}</span><input type="hidden" class="expansion-folder-name" value="${escapeHtml(folder)}">`;

  const metaHtml =
    meta?.name && meta.name !== folder
      ? `<div style="font-size: 0.9rem; color: var(--ctp-subtext-1); font-weight: 500;">${escapeHtml(meta.name)}${meta.version ? ` v${escapeHtml(meta.version)}` : ""}</div>`
      : "";
  const descHtml = meta?.description
    ? `<div class="expansion-desc">${escapeHtml(meta.description)}</div>`
    : isCustom
      ? `<div class="expansion-desc">Custom expansion module configuration</div>`
      : "";

  card.innerHTML = `
    <div class="expansion-card-header">
      <div class="expansion-card-title">
        <div class="expansion-folder-badge" style="gap: 0.5rem;">
          📁 ${folderHeader}
        </div>
        ${metaHtml}
        ${descHtml}
      </div>
      <div>
        <button type="button" class="btn btn-danger" onclick="this.closest('.expansion-card').remove()" title="Delete module configuration">✕ Remove</button>
      </div>
    </div>
    <table class="custom-keys-table">
      <thead>
        <tr>
          <th style="width: 40%;">Variable</th>
          <th style="width: 50%;">Value</th>
          <th style="width: 10%;"></th>
        </tr>
      </thead>
      <tbody class="expansion-vars-body"></tbody>
    </table>
    <div style="margin-top: 0.25rem;">
      <button type="button" class="btn btn-secondary add-exp-var-btn">+ Add Variable</button>
    </div>
  `;

  const tbody = card.querySelector(".expansion-vars-body");
  const varEntries = Object.entries(vars);
  if (varEntries.length === 0 && isCustom) {
    addExpansionVarRow(tbody, "", "");
  } else {
    for (const [k, v] of varEntries) {
      addExpansionVarRow(tbody, k, v);
    }
  }

  card.querySelector(".add-exp-var-btn").onclick = () =>
    addExpansionVarRow(tbody);
  container.appendChild(card);
}

function collectFormData() {
  const config = {
    TEST_VALUE: document.getElementById("TEST_VALUE").value,
    SPOTIFY_CLIENT_ID: document.getElementById("SPOTIFY_CLIENT_ID").value,
    SPOTIFY_CLIENT_SECRET: document.getElementById("SPOTIFY_CLIENT_SECRET")
      .value,
    SPOTIFY_REDIRECT_URI: document.getElementById("SPOTIFY_REDIRECT_URI").value,
  };

  const rows = document.querySelectorAll("#customKeysBody tr");
  rows.forEach((row) => {
    const keyInput = row.querySelector(".custom-key");
    const valInput = row.querySelector(".custom-val");
    if (keyInput && valInput && keyInput.value.trim()) {
      let val = valInput.value;
      try {
        val = JSON.parse(val);
      } catch {}
      config[keyInput.value.trim()] = val;
    }
  });

  const expansion = {};
  const cards = document.querySelectorAll(".expansion-card");
  cards.forEach((card) => {
    const folderInput = card.querySelector(".expansion-folder-name");
    const folderName = folderInput ? folderInput.value.trim() : "";
    if (!folderName) return;

    const modVars = {};
    const varRows = card.querySelectorAll(".expansion-var-row");
    varRows.forEach((vRow) => {
      const kInput = vRow.querySelector(".exp-var-key");
      const vInput = vRow.querySelector(".exp-var-val");
      if (kInput && vInput && kInput.value.trim()) {
        let val = vInput.value;
        try {
          val = JSON.parse(val);
        } catch {}
        modVars[kInput.value.trim()] = val;
      }
    });

    expansion[folderName] = modVars;
  });

  config.expansion = expansion;

  const hiddenJson = document.getElementById("expansion_json");
  if (hiddenJson) {
    hiddenJson.value = JSON.stringify(expansion);
  }

  return config;
}

function syncFormToJson() {
  const data = collectFormData();
  document.getElementById("rawJson").value = JSON.stringify(data, null, 2);
}

async function loadConfig() {
  // Check if redirected from form submission (?saved=true)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("saved") === "true") {
    showToast("Configuration saved successfully!");
  }

  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    if (data.status !== 1) {
      showToast(data.message || "Failed to load config", true);
      return;
    }

    const cfg = data.config || {};
    document.getElementById("configPathBadge").textContent =
      `File: ${data.path || "config.json"}`;

    document.getElementById("TEST_VALUE").value = cfg.TEST_VALUE ?? "";
    document.getElementById("SPOTIFY_CLIENT_ID").value =
      cfg.SPOTIFY_CLIENT_ID ?? "";
    document.getElementById("SPOTIFY_CLIENT_SECRET").value =
      cfg.SPOTIFY_CLIENT_SECRET ?? "";
    document.getElementById("SPOTIFY_REDIRECT_URI").value =
      cfg.SPOTIFY_REDIRECT_URI ?? "";

    // Render custom root settings
    const standardKeys = [
      "TEST_VALUE",
      "SPOTIFY_CLIENT_ID",
      "SPOTIFY_CLIENT_SECRET",
      "SPOTIFY_REDIRECT_URI",
      "expansion",
    ];
    const tbody = document.getElementById("customKeysBody");
    tbody.innerHTML = "";
    for (const [k, v] of Object.entries(cfg)) {
      if (!standardKeys.includes(k)) {
        addCustomKeyRow(k, v);
      }
    }

    // Render expansions
    const discovered = data.modules || [];
    const discoveredMap = new Map(discovered.map((d) => [d.folderName, d]));
    const currentExpansions = cfg.expansion || {};
    const allFolderNames = Array.from(
      new Set([
        ...discovered.map((d) => d.folderName),
        ...Object.keys(currentExpansions),
      ]),
    );

    const expContainer = document.getElementById("expansionCardsContainer");
    expContainer.innerHTML = "";
    for (const folder of allFolderNames) {
      createExpansionCard(
        folder,
        discoveredMap.get(folder),
        currentExpansions[folder] || {},
      );
    }

    document.getElementById("rawJson").value = JSON.stringify(cfg, null, 2);
  } catch (err) {
    showToast("Error loading config: " + err.message, true);
  }
}

// Wire events
document.getElementById("tabFormBtn").onclick = () => switchTab("form");
document.getElementById("tabJsonBtn").onclick = () => switchTab("json");
document.getElementById("toggleSecretBtn").onclick = toggleSecretVisibility;
document.getElementById("addCustomKeyBtn").onclick = () => addCustomKeyRow();
document.getElementById("addExpansionBtn").onclick = () =>
  createExpansionCard("");

document.getElementById("configForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = collectFormData();
  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.status === 1) {
      showToast("Configuration saved successfully!");
      syncFormToJson();
    } else {
      showToast(data.message || "Failed to save configuration", true);
    }
  } catch (err) {
    showToast("Error saving: " + err.message, true);
  }
});

document
  .getElementById("saveRawJsonBtn")
  .addEventListener("click", async () => {
    const rawText = document.getElementById("rawJson").value;
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      showToast("Invalid JSON: " + err.message, true);
      return;
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast("JSON configuration saved successfully!");
        setTimeout(() => loadConfig(), 600);
      } else {
        showToast(data.message || "Failed to save configuration", true);
      }
    } catch (err) {
      showToast("Error saving: " + err.message, true);
    }
  });

// Initial load
loadConfig();
