import isGlob from "is-glob";

export function validateGlobItem(pattern: string) {
  // If it's a valid glob pattern, accept it
  if(isGlob(pattern)) return;

  // If it's not a glob, check if it's a valid file path
  isValidFilePath(pattern);
}

function isValidFilePath(path: string) {
  // Comprehensive validation for file paths
  if(path.length === 0){
    throw new Error("Filepath is empty");
  }

  // Check path length limits (most filesystems have limits)
  if(path.length > 4096){
    throw new Error("Filepath is too long");
  }

  // Check for invalid characters across different platforms
  // Windows: < > : " | ? * and control characters (0x00-0x1f)
  // Unix/Linux: null character (0x00) and forward slash in filenames
  // We'll be restrictive and block characters that are problematic on any major platform
  const invalidChars = /[<>:"|?*\x00-\x1f\x7f]/;
  if(invalidChars.test(path)){
    throw new Error("Filepath contains invalid characters");
  }

  // Check for relative path traversal attempts (more comprehensive)
  const normalizedPath = path.replace(/\\/g, '/'); // Normalize separators
  if(
    normalizedPath.includes('../') ||
    normalizedPath.includes('/..') ||
    normalizedPath === '..' ||
    normalizedPath.startsWith('../') ||
    normalizedPath.endsWith('/..')
  ){
    throw new Error("Filepath contains invalid traversal");
  }

  // Check for absolute paths (we want relative paths only)
  if(path.startsWith('/') || /^[a-zA-Z]:/.test(path)){
    throw new Error("Filepath is absolute");
  }

  // Must not end with a slash (indicating a directory)
  if(path.endsWith('/') || path.endsWith('\\')){
    throw new Error("Filepath ends with a slash");
  }

  // Split into path components and validate each
  const components = normalizedPath.split('/');
  for(const component of components){
    isValidPathComponent(component);
  }

  // Must have at least one component (the filename)
  if(components.length === 0){
    throw new Error("Filepath has no components");
  }
}

function isValidPathComponent(component: string) {
  // Empty components are invalid
  if(component.length === 0){
    throw new Error("Filepath component is empty");
  }

  // Check component length (most filesystems have per-component limits)
  if(component.length > 255){
    throw new Error("Filepath component is too long");
  }

  // Reserved names on Windows (even on other platforms, better to be safe)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];

  const upperComponent = component.toUpperCase();
  const baseName = upperComponent.split('.')[0]; // Remove extension for check
  if(reservedNames.includes(baseName)){
    throw new Error("Filepath component is a reserved name");
  }

  // Must not start or end with spaces (problematic on Windows)
  // Note: Leading dots are actually valid (hidden files on Unix)
  if(component.startsWith(' ') || component.endsWith(' ')){
    throw new Error("Filepath component has leading/trailing spaces");
  }

  // Must not end with dots (problematic on Windows)
  if(component.endsWith('.')){
    throw new Error("Filepath component ends with a dot");
  }

  // Must not be just dots
  if(/^\.+$/.test(component)){
    throw new Error("Filepath component is just dots");
  }
}
