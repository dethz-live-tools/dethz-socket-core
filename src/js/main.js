// deno-lint-ignore-file
var host = window.location.host || "localhost:3000";
var id = btoa(host);
window.id = id;

window.controllerRenderer(host);
