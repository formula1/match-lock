// Type definitions for NW.js
// Project: https://nwjs.io/
// Definitions by: Augment Code Assistant

declare namespace nw {
  interface OpenDialogOptions {
    title?: string;
    defaultPath?: string;
    filters?: FileFilter[];
    properties?: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory')[];
    message?: string;
    securityScopedBookmarks?: boolean;
  }

  interface SaveDialogOptions {
    title?: string;
    defaultPath?: string;
    filters?: FileFilter[];
    message?: string;
    nameFieldLabel?: string;
    showsTagField?: boolean;
    securityScopedBookmarks?: boolean;
  }

  interface FileFilter {
    name: string;
    extensions: string[];
  }

  interface WindowOptions {
    title?: string;
    icon?: string;
    toolbar?: boolean;
    frame?: boolean;
    width?: number;
    height?: number;
    min_width?: number;
    min_height?: number;
    max_width?: number;
    max_height?: number;
    position?: 'center' | 'mouse';
    x?: number;
    y?: number;
    fullscreen?: boolean;
    show?: boolean;
    show_in_taskbar?: boolean;
    resizable?: boolean;
    always_on_top?: boolean;
    visible_on_all_workspaces?: boolean;
    transparent?: boolean;
    kiosk?: boolean;
    new_instance?: boolean;
    inject_js_start?: string;
    inject_js_end?: string;
    id?: string;
  }

  interface Window {
    // Window control methods
    show(): void;
    hide(): void;
    close(force?: boolean): void;
    focus(): void;
    blur(): void;
    minimize(): void;
    maximize(): void;
    unmaximize(): void;
    restore(): void;
    enterFullscreen(): void;
    leaveFullscreen(): void;
    toggleFullscreen(): void;
    enterKioskMode(): void;
    leaveKioskMode(): void;
    toggleKioskMode(): void;
    showDevTools(iframe?: string | HTMLIFrameElement, callback?: () => void): void;
    closeDevTools(): void;
    isDevToolsOpen(): boolean;

    // Window properties
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    menu: Menu | null;
    isFullscreen: boolean;
    isTransparent: boolean;
    isKioskMode: boolean;
    zoomLevel: number;
    cookies: Cookies;
    window: globalThis.Window;

    // Window methods
    moveTo(x: number, y: number): void;
    moveBy(x: number, y: number): void;
    resizeTo(width: number, height: number): void;
    resizeBy(width: number, height: number): void;
    setAlwaysOnTop(top: boolean): void;
    setVisibleOnAllWorkspaces(visible: boolean): void;
    canSetVisibleOnAllWorkspaces(): boolean;
    setMaximumSize(width: number, height: number): void;
    setMinimumSize(width: number, height: number): void;
    setResizable(resizable: boolean): void;
    setPosition(position: 'center' | 'mouse'): void;
    setShowInTaskbar(show: boolean): void;
    requestAttention(attention: boolean | number): void;
    capturePage(callback: (dataUrl: string) => void, config?: 'png' | 'jpeg' | { format?: 'png' | 'jpeg'; datatype?: 'raw' | 'buffer' | 'datauri' }): void;
    reload(): void;
    reloadIgnoringCache(): void;
    setShadow(shadow: boolean): void;
    eval(frame: HTMLIFrameElement | null, script: string): any;
    evalNWBin(frame: HTMLIFrameElement | null, path: string): any;

    // File dialog methods
    showOpenDialog(options?: OpenDialogOptions, callback?: (filePaths: string[]) => void): void;
    showSaveDialog(options?: SaveDialogOptions, callback?: (filePath: string) => void): void;

    // Events
    on(event: 'close', listener: () => void): void;
    on(event: 'closed', listener: () => void): void;
    on(event: 'loading', listener: () => void): void;
    on(event: 'loaded', listener: () => void): void;
    on(event: 'document-start', listener: (frame: HTMLIFrameElement) => void): void;
    on(event: 'document-end', listener: (frame: HTMLIFrameElement) => void): void;
    on(event: 'focus', listener: () => void): void;
    on(event: 'blur', listener: () => void): void;
    on(event: 'minimize', listener: () => void): void;
    on(event: 'maximize', listener: () => void): void;
    on(event: 'restore', listener: () => void): void;
    on(event: 'resize', listener: (width: number, height: number) => void): void;
    on(event: 'move', listener: (x: number, y: number) => void): void;
    on(event: 'enter-fullscreen', listener: () => void): void;
    on(event: 'leave-fullscreen', listener: () => void): void;
    on(event: 'zoom', listener: (level: number) => void): void;
    on(event: 'capturepagedone', listener: () => void): void;
    on(event: 'devtools-opened', listener: (url: string) => void): void;
    on(event: 'devtools-closed', listener: () => void): void;
    on(event: 'new-win-policy', listener: (frame: HTMLIFrameElement, url: string, policy: any) => void): void;
    on(event: 'navigation', listener: (frame: HTMLIFrameElement, url: string, policy: any) => void): void;
    on(event: string, listener: (...args: any[]) => void): void;

    removeListener(event: string, listener: (...args: any[]) => void): void;
    removeAllListeners(event?: string): void;
  }

  interface Menu {
    items: MenuItem[];
    append(item: MenuItem): void;
    insert(item: MenuItem, i: number): void;
    remove(item: MenuItem): void;
    removeAt(i: number): void;
    popup(x: number, y: number): void;
    createMacBuiltin(appname: string, options?: any): void;
  }

  interface MenuItemOptions {
    label?: string;
    icon?: string;
    tooltip?: string;
    type?: 'normal' | 'checkbox' | 'separator';
    checked?: boolean;
    enabled?: boolean;
    submenu?: Menu;
    click?: () => void;
    key?: string;
    modifiers?: string;
  }

  interface MenuItem {
    type: 'normal' | 'checkbox' | 'separator';
    label: string;
    icon: string;
    tooltip: string;
    checked: boolean;
    enabled: boolean;
    submenu: Menu | null;
    click: () => void;
    key: string;
    modifiers: string;

    constructor(options: MenuItemOptions);
  }

  interface Tray {
    title: string;
    tooltip: string;
    icon: string;
    alticon: string;
    iconsAreTemplates: boolean;
    menu: Menu | null;

    remove(): void;

    on(event: 'click', listener: () => void): void;
    on(event: string, listener: (...args: any[]) => void): void;
  }

  interface Clipboard {
    get(type?: 'text' | 'png' | 'jpeg' | 'html' | 'rtf'): string;
    set(data: string, type?: 'text' | 'png' | 'jpeg' | 'html' | 'rtf'): void;
    clear(): void;
    readAvailableTypes(): string[];
  }

  interface Shell {
    openExternal(uri: string): void;
    openItem(file_path: string): void;
    showItemInFolder(file_path: string): void;
  }

  interface App {
    argv: string[];
    fullArgv: string[];
    filteredArgv: string[];
    startPath: string;
    dataPath: string;
    manifest: any;

    clearCache(): void;
    closeAllWindows(): void;
    crashBrowser(): void;
    crashRenderer(): void;
    getProxyForURL(url: string): string;
    quit(): void;
    setCrashDumpDir(dir: string): void;
    addOriginAccessWhitelistEntry(sourceOrigin: string, destinationProtocol: string, destinationHost: string, allowDestinationSubdomains: boolean): void;
    removeOriginAccessWhitelistEntry(sourceOrigin: string, destinationProtocol: string, destinationHost: string, allowDestinationSubdomains: boolean): void;
    registerGlobalHotKey(shortcut: Shortcut): void;
    unregisterGlobalHotKey(shortcut: Shortcut): void;

    on(event: 'open', listener: (cmdline: string) => void): void;
    on(event: 'reopen', listener: () => void): void;
    on(event: string, listener: (...args: any[]) => void): void;
  }

  interface Shortcut {
    key: string;
    active: () => void;
    failed: (msg: string) => void;
  }

  interface Cookies {
    get(details: any, callback: (cookies: any[]) => void): void;
    getAll(details: any, callback: (cookies: any[]) => void): void;
    remove(details: any, callback?: () => void): void;
    set(details: any, callback?: () => void): void;

    onChanged: {
      addListener(callback: (changeInfo: any) => void): void;
      removeListener(callback: (changeInfo: any) => void): void;
    };
  }

  interface Screen {
    screens: ScreenInfo[];
    chooseDesktopMedia(sources: string[], callback: (streamId: string) => void): void;

    on(event: 'displayBoundsChanged', listener: (screen: ScreenInfo) => void): void;
    on(event: 'displayAdded', listener: (screen: ScreenInfo) => void): void;
    on(event: 'displayRemoved', listener: (screen: ScreenInfo) => void): void;
  }

  interface ScreenInfo {
    id: string;
    bounds: { x: number; y: number; width: number; height: number };
    work_area: { x: number; y: number; width: number; height: number };
    scaleFactor: number;
    isBuiltIn: boolean;
    rotation: number;
    touchSupport: 'available' | 'unavailable' | 'unknown';
  }

  // Global nw object
  const Window: {
    open(url: string, options?: WindowOptions, callback?: (win: Window) => void): Window;
    get(window_object?: globalThis.Window): Window;
  };

  const Menu: {
    new(options?: any): Menu;
    setApplicationMenu(menu: Menu): void;
  };

  const MenuItem: {
    new(options: MenuItemOptions): MenuItem;
  };

  const Tray: {
    new(options: any): Tray;
  };

  const Clipboard: Clipboard;
  const Shell: Shell;
  const App: App;
  const Screen: Screen;

  const Shortcut: {
    new(options: any): Shortcut;
  };
}

// Make nw available globally
declare const nw: typeof nw;

// For CommonJS environments
declare module 'nw.gui' {
  export = nw;
}
