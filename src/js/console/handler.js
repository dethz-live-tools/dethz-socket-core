// deno-lint-ignore-file
var escapeHtmlConsole = (text) => {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

var logHandler = (msg) => {
  const logBox = document.querySelector("#log-box");
  if (!logBox) return;

  const emptyEl = document.querySelector("#log-empty");
  if (emptyEl) emptyEl.remove();

  const logData = msg.replace(/^log:\s*/, "");
  const errState = logData.startsWith("error -- ");
  const sucState = logData.startsWith("success -- ");
  const cleanData = errState
    ? logData.replace("error -- ", "")
    : (sucState ? logData.replace("success -- ", "") : logData);

  const timeStr = new Date().toLocaleTimeString();
  const tagLabel = errState ? "ERR" : (sucState ? "OK" : "INFO");
  const tagClass = errState ? "tag-error" : (sucState ? "tag-success" : "tag-info");

  const newMessage = `<div class="logData">
    <span class="date">${timeStr}</span>
    <span class="log-tag ${tagClass}">${tagLabel}</span>
    <span class="data ${errState ? "error" : sucState ? "success" : ""}">${escapeHtmlConsole(cleanData)}</span>
  </div>`;

  const oldElement = logBox.innerHTML;
  logBox.innerHTML = newMessage + oldElement;

  while (logBox.children.length > 250) {
    logBox.removeChild(logBox.lastChild);
  }
};
window.logHandler = logHandler;
