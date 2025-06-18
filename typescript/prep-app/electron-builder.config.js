/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.matchlock.prep-app',
  productName: 'MatchLock Prep App',
  copyright: 'Copyright © 2024 MatchLock',
  
  directories: {
    output: 'dist-electron',
    buildResources: 'build-resources',
  },
  
  files: [
    'dist/**/*',               // Vite-built renderer files
    'dist-electron/main.cjs',  // Bundled main process
    'dist-electron/preload.cjs', // Bundled preload script
    // No node_modules needed - everything is bundled!
  ],
  
  extraResources: [
    // Add any extra resources your app needs here
  ],
  
  mac: {
    category: 'public.app-category.games',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'build-resources/icon.icns',
  },
  
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      }
    ],
    icon: 'build-resources/icon.ico',
  },
  
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    icon: 'build-resources/icon.png',
    category: 'Game',
  },
  
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
  
  dmg: {
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ]
  },
  
  publish: {
    provider: 'github',
    owner: 'your-github-username',
    repo: 'match-lock',
    private: true,
  },
};
