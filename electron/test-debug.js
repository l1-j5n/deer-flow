// Debug: what does require("electron") return?
const electron = require("electron");
console.log("electron type:", typeof electron);
console.log("electron keys:", Object.keys(electron));
console.log("electron string:", String(electron).substring(0, 200));
console.log("has app:", "app" in electron);
console.log("electron.app:", electron.app);
process.exit(0);
