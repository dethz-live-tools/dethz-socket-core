// deno-lint-ignore-file
var consoleController = (isOnline) => {
  logAnimationFunction();

  const clearBtn = document.querySelector("#clear-console-logs");
  if (clearBtn) {
    clearBtn.onclick = () => {
      const box = document.querySelector("#log-box");
      if (box) {
        box.innerHTML = `<div class="log-empty-state" id="log-empty">
          <span>Console logs cleared. Listening for WebSocket events...</span>
        </div>`;
      }
    };
  }
};
window.consoleController = consoleController;
