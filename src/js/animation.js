// deno-lint-ignore-file
var spotifyAnimationFunction = () => {
  const header = document.querySelector("#spt-header");
  if (!header) return;

  header.onclick = () => {
    const target = document.querySelector("#spt-dash");
    if (!target) return;

    if (target.classList.contains("hidden")) {
      target.classList.remove("hidden");
      localStorage.setItem("spt-hide", "false");
    } else {
      target.classList.add("hidden");
      localStorage.setItem("spt-hide", "true");
    }
  };
};

var logAnimationFunction = () => {
  const consoleHeader = document.querySelector("#console-header");
  if (consoleHeader) {
    consoleHeader.onclick = () => {
      const target = document.querySelector("#console-container");
      if (!target) return;

      if (target.classList.contains("hidden")) {
        target.classList.remove("hidden");
        localStorage.setItem("log-hide", "false");
      } else {
        target.classList.add("hidden");
        localStorage.setItem("log-hide", "true");
      }
    };
  }

  const tiktokHeader = document.querySelector("#tiktok-header");
  if (tiktokHeader) {
    tiktokHeader.onclick = () => {
      const target = document.querySelector("#tiktok-container");
      if (!target) return;

      if (target.classList.contains("hidden")) {
        target.classList.remove("hidden");
        localStorage.setItem("tt-hide", "false");
      } else {
        target.classList.add("hidden");
        localStorage.setItem("tt-hide", "true");
      }
    };
  }

  const ttsHeader = document.querySelector("#tts-header");
  if (ttsHeader) {
    ttsHeader.onclick = () => {
      const target = document.querySelector("#tts-container");
      if (!target) return;

      if (target.classList.contains("hidden")) {
        target.classList.remove("hidden");
        localStorage.setItem("tts-hide", "false");
      } else {
        target.classList.add("hidden");
        localStorage.setItem("tts-hide", "true");
      }
    };
  }
};

window.spotifyAnimationFunction = spotifyAnimationFunction;
window.logAnimationFunction = logAnimationFunction;
