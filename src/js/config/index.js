// ponytail: minimal vanilla DOM config controller
let activeModule = "all";
let discoveredModules = [];
let currentView = "core";

const initialParams = new URLSearchParams(window.location.search);
if (initialParams.get("module")) {
  activeModule = initialParams.get("module");
}
const initialView = initialParams.get("view");
if (initialView === "expansions" || initialParams.get("module")) {
  currentView = "modules";
} else {
  currentView = "core";
}

if (typeof mountSidebar === "function") {
  mountSidebar(
    "config",
    "#sidebar-slot",
    activeModule !== "all" ? activeModule : null,
    currentView === "modules" ? "expansions" : "core",
  );
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
  if (!toast) return;
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
  currentView = tab;
  const formCard = document.getElementById("configForm");
  const jsonCard = document.getElementById("jsonView");
  const coreBtn = document.getElementById("tabCoreBtn");
  const modulesBtn = document.getElementById("tabModulesBtn");
  const jsonBtn = document.getElementById("tabJsonBtn");
  const globalSection = document.getElementById("globalSettingsSection");
  const customSection = document.getElementById("customSettingsSection");
  const expansionsSection = document.getElementById("expansionsSection");
  const formActions = document.getElementById("formActions");
  const saveBtn = document.getElementById("saveBtn");

  // Reset active tabs
  if (coreBtn) coreBtn.classList.remove("active");
  if (modulesBtn) modulesBtn.classList.remove("active");
  if (jsonBtn) jsonBtn.classList.remove("active");

  if (tab === "core") {
    if (formCard) formCard.style.display = "flex";
    if (jsonCard) jsonCard.style.display = "none";
    if (globalSection) globalSection.style.display = "block";
    if (customSection) customSection.style.display = "block";
    if (expansionsSection) expansionsSection.style.display = "none";
    if (formActions) formActions.style.display = "flex";
    if (saveBtn) saveBtn.textContent = "💾 Save Core Configuration";
    if (coreBtn) coreBtn.classList.add("active");
  } else if (tab === "modules") {
    if (formCard) formCard.style.display = "flex";
    if (jsonCard) jsonCard.style.display = "none";
    if (globalSection) globalSection.style.display = "none";
    if (customSection) customSection.style.display = "none";
    if (expansionsSection) expansionsSection.style.display = "block";
    if (formActions) formActions.style.display = "flex";
    if (saveBtn) saveBtn.textContent = "💾 Save All Expansions";
    if (modulesBtn) modulesBtn.classList.add("active");
  } else {
    syncFormToJson();
    if (formCard) formCard.style.display = "none";
    if (jsonCard) jsonCard.style.display = "flex";
    if (jsonBtn) jsonBtn.classList.add("active");
  }

  // Sync URL view parameter
  try {
    const url = new URL(window.location.href);
    if (tab === "core") {
      url.searchParams.delete("view");
    } else if (tab === "modules") {
      url.searchParams.set("view", "expansions");
    } else {
      url.searchParams.set("view", tab);
    }
    window.history.replaceState({}, "", url.toString());
  } catch {}

  // Update sidebar active item
  const sidebarSlot = document.querySelector("#status");
  if (sidebarSlot && typeof renderSidebar === "function") {
    const viewArg = tab === "modules" ? "expansions" : "core";
    sidebarSlot.outerHTML = renderSidebar("config", activeModule !== "all" ? activeModule : null, viewArg);
    if (typeof loadSidebarExpansions === "function") {
      loadSidebarExpansions(activeModule !== "all" ? activeModule : null);
    }
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

function updateExpansionMenu() {
  const menuBar = document.getElementById("expansionMenuBar");
  if (!menuBar) return;

  const cards = Array.from(document.querySelectorAll(".expansion-card"));
  const countBadge = document.getElementById("moduleCountBadge");
  if (countBadge) {
    countBadge.textContent = String(cards.length);
  }

  menuBar.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "expansion-menu-item" + (activeModule === "all" ? " active" : "");
  allBtn.setAttribute("data-module", "all");
  allBtn.innerHTML = `
    <span class="exp-icon">📦</span>
    <span>All Modules</span>
    <span class="badge exp-count-badge">${cards.length}</span>
  `;
  allBtn.onclick = () => selectModule("all");
  menuBar.appendChild(allBtn);

  cards.forEach((card) => {
    const fInput = card.querySelector(".expansion-folder-name");
    const folder = fInput ? fInput.value.trim() : card.getAttribute("data-folder") || "";
    if (!folder) return;

    const meta = discoveredModules.find((m) => m.folderName === folder || m.name === folder);
    const displayName = meta?.name || folder;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "expansion-menu-item" + (activeModule === folder ? " active" : "");
    btn.setAttribute("data-module", folder);
    btn.title = `Configure ${displayName}`;
    btn.innerHTML = `
      <span class="exp-icon">🧩</span>
      <span>${escapeHtml(displayName)}</span>
      ${meta?.version ? `<span class="badge exp-count-badge">v${escapeHtml(meta.version)}</span>` : ""}
    `;
    btn.onclick = () => selectModule(folder);
    menuBar.appendChild(btn);
  });
}

function selectModule(targetModule) {
  activeModule = targetModule;

  // Filter expansion cards
  const cards = document.querySelectorAll(".expansion-card");
  cards.forEach((card) => {
    const fInput = card.querySelector(".expansion-folder-name");
    const folder = fInput ? fInput.value.trim() : card.getAttribute("data-folder") || "";
    if (activeModule === "all" || folder === activeModule) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });

  // Highlight menu bar button
  const menuButtons = document.querySelectorAll(".expansion-menu-item");
  menuButtons.forEach((btn) => {
    const mod = btn.getAttribute("data-module");
    if (mod === activeModule) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update URL without page reload
  try {
    const url = new URL(window.location.href);
    if (activeModule === "all") {
      url.searchParams.delete("module");
    } else {
      url.searchParams.set("module", activeModule);
    }
    window.history.replaceState({}, "", url.toString());
  } catch {}

  // Update sidebar if available
  if (typeof loadSidebarExpansions === "function") {
    loadSidebarExpansions(activeModule !== "all" ? activeModule : null);
  }
}

function collectCoreData() {
  const core = {
    TEST_VALUE: document.getElementById("TEST_VALUE").value,
    SPOTIFY_CLIENT_ID: document.getElementById("SPOTIFY_CLIENT_ID").value,
    SPOTIFY_CLIENT_SECRET: document.getElementById("SPOTIFY_CLIENT_SECRET").value,
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
      core[keyInput.value.trim()] = val;
    }
  });

  return core;
}

async function saveCoreConfig() {
  const coreData = collectCoreData();
  try {
    const res = await fetch("/api/config/core", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coreData),
    });
    const data = await res.json();
    if (data.status === 1) {
      showToast("Core configuration saved successfully!");
      syncFormToJson();
    } else {
      showToast(data.message || "Failed to save core configuration", true);
    }
  } catch (err) {
    showToast("Error saving core: " + err.message, true);
  }
}

async function saveModuleConfig(card) {
  if (!card) return;
  const folderInput = card.querySelector(".expansion-folder-name");
  const folder = folderInput ? folderInput.value.trim() : card.getAttribute("data-folder") || "";

  if (!folder) {
    showToast("Please enter a module folder name first", true);
    return;
  }

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

  try {
    const res = await fetch(`/api/config/expansion/${encodeURIComponent(folder)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modVars),
    });
    const data = await res.json();
    if (data.status === 1) {
      showToast(`Module "${folder}" configuration saved successfully!`);
      syncFormToJson();
    } else {
      showToast(data.message || `Failed to save ${folder} configuration`, true);
    }
  } catch (err) {
    showToast("Error saving module config: " + err.message, true);
  }
}

function createExpansionCard(folder, meta = null, vars = {}) {
  const container = document.getElementById("expansionCardsContainer");
  const card = document.createElement("div");
  card.className = "expansion-card";
  card.setAttribute("data-folder", folder || "");

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

  const routeBadgeHtml = meta?.route || meta?.routePath
    ? `<span class="module-meta-badge" style="color: var(--ctp-teal);">Route: ${escapeHtml(meta.route || meta.routePath)}</span>`
    : "";

  card.innerHTML = `
    <div class="expansion-card-header">
      <div class="expansion-card-title">
        <div class="expansion-folder-badge" style="gap: 0.5rem;">
          📁 ${folderHeader}
        </div>
        ${metaHtml}
        ${descHtml}
        ${routeBadgeHtml ? `<div class="module-meta-badges">${routeBadgeHtml}</div>` : ""}
      </div>
      <div class="card-action-group">
        <button type="button" class="btn-save-module" title="Save this module's configuration">💾 Save Module</button>
        <button type="button" class="btn btn-danger btn-remove-module" title="Delete module configuration">✕ Remove</button>
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

  card.querySelector(".btn-save-module").onclick = () =>
    saveModuleConfig(card);

  card.querySelector(".btn-remove-module").onclick = () => {
    card.remove();
    updateExpansionMenu();
    if (activeModule !== "all") {
      selectModule("all");
    }
  };

  if (isCustom) {
    const fInput = card.querySelector(".expansion-folder-name");
    if (fInput) {
      fInput.addEventListener("input", () => {
        const val = fInput.value.trim();
        card.setAttribute("data-folder", val);
        updateExpansionMenu();
      });
    }
  }

  // Filter display based on current activeModule
  if (activeModule !== "all" && folder && folder !== activeModule) {
    card.style.display = "none";
  }

  container.appendChild(card);
  updateExpansionMenu();
}

function collectExpansionsData() {
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
  return expansion;
}

function collectFormData() {
  const config = collectCoreData();
  const expansion = collectExpansionsData();

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
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("saved") === "true") {
    showToast("Configuration saved successfully!");
  }

  const viewParam = urlParams.get("view");
  if (viewParam === "expansions" || urlParams.get("module")) {
    switchTab("modules");
  } else {
    switchTab("core");
  }

  if (urlParams.get("module")) {
    activeModule = urlParams.get("module");
  }

  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    if (data.status !== 1) {
      showToast(data.message || "Failed to load config", true);
      return;
    }

    discoveredModules = data.modules || [];
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
    const discoveredMap = new Map(discoveredModules.map((d) => [d.folderName, d]));
    const currentExpansions = cfg.expansion || {};
    const allFolderNames = Array.from(
      new Set([
        ...discoveredModules.map((d) => d.folderName),
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

    updateExpansionMenu();

    if (activeModule !== "all") {
      selectModule(activeModule);
    }

    document.getElementById("rawJson").value = JSON.stringify(cfg, null, 2);
  } catch (err) {
    showToast("Error loading config: " + err.message, true);
  }
}

// Wire events
const coreTabBtn = document.getElementById("tabCoreBtn");
if (coreTabBtn) {
  coreTabBtn.onclick = () => switchTab("core");
}
const modulesTabBtn = document.getElementById("tabModulesBtn");
if (modulesTabBtn) {
  modulesTabBtn.onclick = () => switchTab("modules");
}
document.getElementById("tabJsonBtn").onclick = () => switchTab("json");

const saveCoreTopBtn = document.getElementById("saveCoreTopBtn");
if (saveCoreTopBtn) {
  saveCoreTopBtn.onclick = () => saveCoreConfig();
}

document.getElementById("toggleSecretBtn").onclick = toggleSecretVisibility;
document.getElementById("addCustomKeyBtn").onclick = () => addCustomKeyRow();
document.getElementById("addExpansionBtn").onclick = () => {
  createExpansionCard("");
  switchTab("modules");
  selectModule("all");
};

document.getElementById("configForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (currentView === "core") {
    await saveCoreConfig();
    return;
  }

  if (currentView === "modules") {
    // Save all expansions
    const expansions = collectExpansionsData();
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expansion: expansions }),
      });
      const data = await res.json();
      if (data.status === 1) {
        showToast("Expansions saved successfully!");
        syncFormToJson();
      } else {
        showToast(data.message || "Failed to save expansions", true);
      }
    } catch (err) {
      showToast("Error saving: " + err.message, true);
    }
    return;
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
