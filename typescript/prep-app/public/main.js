console.log("🚀 NW.js main.js has started");

const { join: pathJoin } = require('path');
const { readFileSync } = require('fs');

// Read NW.js config from the local package.json
const config = JSON.parse(readFileSync(pathJoin(__dirname, 'package.json'), 'utf-8'));

const isDev = process.env.NODE_ENV !== 'production';
const url = isDev ? 'http://localhost:5173' : 'index.html';

console.log("About to start NW.js");
nw.Window.open(url, config.window, (win) => {
  console.log("NW.js started");
  win.show();         // Ensures it becomes visible
  win.focus();        // Brings to foreground
  // Setup devTools with manual trigger and error handling
  win.on("loaded", () => {
    console.log("Window loaded, devTools available via F12 or right-click");

    // Add keyboard shortcut for devTools (F12)
    win.on('keydown', (event) => {
      if (event.key === 'F12') {
        try {
          if (win.isDevToolsOpen()) {
            win.closeDevTools();
            console.log("DevTools closed");
          } else {
            console.log("Opening DevTools...");
            win.showDevTools();
            console.log("DevTools opened successfully");
          }
        } catch (error) {
          console.error("Failed to toggle DevTools:", error);
        }
      }
    });
  });

  // Add error handling for devtools events
  win.on('devtools-opened', (url) => {
    console.log('DevTools opened at:', url);
  });

  win.on('devtools-closed', () => {
    console.log('DevTools closed');
  });
});
