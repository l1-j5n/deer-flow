// Minimal test: does Electron's require("electron") work?
const { app, BrowserWindow } = require("electron");

console.log("app:", typeof app);
console.log("BrowserWindow:", typeof BrowserWindow);

app.whenReady().then(() => {
  console.log("App is ready!");
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "DeerFlow Test",
  });
  win.loadURL("data:text/html,<h1>Hello from DeerFlow Electron!</h1>");
  console.log("Window created!");

  // Auto-close after 5 seconds
  setTimeout(() => {
    console.log("Closing...");
    app.quit();
  }, 5000);
});
