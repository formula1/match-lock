#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get target triple from rustc
const rustInfo = execSync('rustc -vV').toString();
const targetTripleMatch = /host: (\S+)/g.exec(rustInfo);
if (!targetTripleMatch) {
  console.error('Failed to determine platform target triple');
  process.exit(1);
}
const targetTriple = targetTripleMatch[1];
console.log(`Target triple: ${targetTriple}`);

// Determine platform-specific settings
const isWindows = process.platform === 'win32';
const extension = isWindows ? '.exe' : '';

// Map target triple to pkg target
const pkgTargetMap = {
  'x86_64-unknown-linux-gnu': 'node18-linux-x64',
  'x86_64-apple-darwin': 'node18-macos-x64',
  'aarch64-apple-darwin': 'node18-macos-arm64',
  'x86_64-pc-windows-msvc': 'node18-win-x64',
};

const pkgTarget = pkgTargetMap[targetTriple];
if (!pkgTarget) {
  console.error(`Unsupported target triple: ${targetTriple}`);
  console.error('Supported targets:', Object.keys(pkgTargetMap).join(', '));
  process.exit(1);
}

// Paths
const scriptDir = __dirname;
const sidecarRoot = path.dirname(scriptDir);
const distDir = path.join(sidecarRoot, 'dist');
const inputFile = path.join(distDir, 'index.js');
const outputDir = path.join(sidecarRoot, '..', 'src-tauri', 'binaries');
const outputFile = path.join(outputDir, `node-sidecar-${targetTriple}${extension}`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Input file not found: ${inputFile}`);
  console.error('Run "npm run build:ts" first');
  process.exit(1);
}

console.log(`Building sidecar for ${pkgTarget}...`);
console.log(`Input: ${inputFile}`);
console.log(`Output: ${outputFile}`);

// Run pkg
try {
  execSync(
    `npx @yao-pkg/pkg "${inputFile}" --target ${pkgTarget} --output "${outputFile}"`,
    { stdio: 'inherit', cwd: sidecarRoot }
  );
  console.log(`✅ Sidecar built successfully: ${outputFile}`);
} catch (error) {
  console.error('❌ Failed to build sidecar:', error.message);
  process.exit(1);
}

