# NW.js TypeScript Definitions

This package contains TypeScript definitions for NW.js (formerly node-webkit).

## Usage

The types are automatically available when you include this folder in your TypeScript configuration. The global `nw` object will have full type support.

## Examples

```typescript
// Get the current window
const win = nw.Window.get();

// Window operations with type safety
win.title = "My App";
win.show();
win.focus();
win.maximize();

// Event listeners with proper typing
win.on('close', () => {
  console.log('Window is closing');
});

win.on('resize', (width: number, height: number) => {
  console.log(`New size: ${width}x${height}`);
});

// Create menus
const menu = new nw.Menu();
const menuItem = new nw.MenuItem({
  label: 'File',
  click: () => console.log('File clicked')
});
menu.append(menuItem);

// App operations
nw.App.quit();
nw.Shell.openExternal('https://example.com');

// Clipboard operations
nw.Clipboard.set('Hello World');
const text = nw.Clipboard.get();
```

## API Coverage

This definition file covers:

- **Window**: Window management, events, and properties
- **Menu/MenuItem**: Application and context menus
- **App**: Application lifecycle and global operations
- **Shell**: System shell operations
- **Clipboard**: Clipboard read/write operations
- **Tray**: System tray functionality
- **Screen**: Screen and display information
- **Shortcut**: Global keyboard shortcuts

## Notes

- These definitions are based on NW.js v0.100.x
- Some advanced or experimental APIs may not be included
- Feel free to extend the definitions as needed for your specific use case
