// deno-lint-ignore-file
var coreUpdateState = {
  checking: false,
  updating: false,
  currentVersion: null,
  latestVersion: null,
  hasUpdate: false,
  releaseNotes: null,
};

var getUpdateApiBase = () => {
  return `${window.location.origin}/api/update`;
};

var escapeHtmlUpdate = (text) => {
  if (typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

var checkCoreUpdate = async (silent = true) => {
  if (coreUpdateState.checking) return;
  coreUpdateState.checking = true;

  const indicator = document.querySelector("#update-status-indicator");
  const statusText = document.querySelector("#update-status-text");
  const checkBtn = document.querySelector("#btn-check-update");
  const versionBadge = document.querySelector("#core-version");
  const updateBadge = document.querySelector("#brand-update-badge");
  const actionRow = document.querySelector("#update-action-container");
  const targetVerEl = document.querySelector("#update-target-version");

  if (indicator) indicator.innerText = "🟡";
  if (statusText) statusText.innerText = "Checking updates...";
  if (checkBtn) {
    checkBtn.disabled = true;
    checkBtn.innerText = "...";
  }

  try {
    const apiBase = getUpdateApiBase();
    const res = await fetch(`${apiBase}/check`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    coreUpdateState.currentVersion = data.currentVersion || "v1.0.1";
    coreUpdateState.latestVersion = data.latestVersion;
    coreUpdateState.hasUpdate = Boolean(data.hasUpdate);
    coreUpdateState.releaseNotes = data.releaseNotes;

    // Update dynamic version label in header
    if (versionBadge && coreUpdateState.currentVersion) {
      versionBadge.innerText = coreUpdateState.currentVersion;
    }

    if (coreUpdateState.hasUpdate) {
      if (indicator) indicator.innerText = "🔔";
      if (statusText) statusText.innerText = `New: ${data.latestVersion}`;
      if (updateBadge) {
        updateBadge.classList.remove("hidden");
        updateBadge.innerText = `NEW ${data.latestVersion}`;
      }
      if (actionRow) actionRow.classList.remove("hidden");
      if (targetVerEl) targetVerEl.innerText = data.latestVersion;

      if (!silent && typeof Swal !== "undefined") {
        Swal.fire({
          title: "Update Available!",
          html: `<div style="text-align: left; font-size: 13px; line-height: 1.5;">
            <p>A new version of <b>Stream Overlay Socket Core</b> is ready to install.</p>
            <div style="background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 6px; margin: 10px 0; border: 1px solid rgba(255,255,255,0.08);">
              <div><b>Installed:</b> <code>${data.currentVersion || "none"}</code></div>
              <div><b>Latest:</b> <code style="color: #a6e3a1;">${data.latestVersion}</code></div>
            </div>
            ${
              data.releaseNotes
                ? `<details style="margin-top: 8px;"><summary style="cursor: pointer; font-weight: 600; color: #89b4fa;">View Release Notes</summary><pre style="white-space: pre-wrap; font-size: 11px; max-height: 180px; overflow-y: auto; text-align: left; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; margin-top: 6px;">${escapeHtmlUpdate(
                    data.releaseNotes,
                  )}</pre></details>`
                : ""
            }
          </div>`,
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#a6e3a1",
          cancelButtonColor: "#6c7086",
          confirmButtonText: "Update Now",
          cancelButtonText: "Later",
        }).then((result) => {
          if (result.isConfirmed) {
            applyCoreUpdate(data.latestVersion);
          }
        });
      }
    } else {
      if (indicator) indicator.innerText = "🟢";
      if (statusText) statusText.innerText = `Up to date (${coreUpdateState.currentVersion})`;
      if (updateBadge) updateBadge.classList.add("hidden");
      if (actionRow) actionRow.classList.add("hidden");

      if (!silent && typeof Swal !== "undefined") {
        Swal.fire({
          icon: "success",
          title: "Up to Date!",
          text: `Stream Overlay Core is running the latest version (${coreUpdateState.currentVersion}).`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  } catch (err) {
    console.error("[UpdateChecker] Error:", err);
    if (indicator) indicator.innerText = "⚪";
    if (statusText) statusText.innerText = "Check failed";
    if (!silent && typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "Update Check Failed",
        text: err?.message || "Could not reach the update server.",
      });
    }
  } finally {
    coreUpdateState.checking = false;
    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.innerText = "Check";
    }
  }
};

var applyCoreUpdate = async (targetVersion) => {
  if (coreUpdateState.updating) return;
  coreUpdateState.updating = true;

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "Updating Core Engine...",
      html: `Downloading and extracting <b>${targetVersion || "latest"}</b> from GitHub.<br><span style="font-size: 12px; color: #a6adc8;">Please do not close this window.</span>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  try {
    const apiBase = getUpdateApiBase();
    const res = await fetch(`${apiBase}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: targetVersion }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    if (result.success) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "success",
          title: "Update Installed!",
          html: `Successfully updated to <b>${result.version}</b> (${result.extractedCount} files updated).<br>Reloading dashboard...`,
          timer: 2500,
          showConfirmButton: false,
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      throw new Error(result.error || "Update operation failed.");
    }
  } catch (err) {
    console.error("[UpdateCore] Failed:", err);
    coreUpdateState.updating = false;
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err?.message || "An error occurred while updating the core.",
      });
    }
  }
};

var initCoreUpdater = () => {
  const checkBtn = document.querySelector("#btn-check-update");
  if (checkBtn) {
    checkBtn.addEventListener("click", () => checkCoreUpdate(false));
  }

  const applyBtn = document.querySelector("#btn-apply-update");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      if (coreUpdateState.latestVersion) {
        applyCoreUpdate(coreUpdateState.latestVersion);
      }
    });
  }

  const brandBadge = document.querySelector("#brand-update-badge");
  if (brandBadge) {
    brandBadge.addEventListener("click", () => checkCoreUpdate(false));
  }

  // Initial silent check
  setTimeout(() => {
    checkCoreUpdate(true);
  }, 400);
};

window.coreUpdateState = coreUpdateState;
window.checkCoreUpdate = checkCoreUpdate;
window.applyCoreUpdate = applyCoreUpdate;
window.initCoreUpdater = initCoreUpdater;
