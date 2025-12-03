import isGlob from "is-glob";

import { isValidFilePath } from "./filepath";
export function validateGlobItem(pattern: string) {
  // If it's a valid glob pattern, accept it
  if(isGlob(pattern)) return;

  // If it's not a glob, check if it's a valid file path
  isValidFilePath(pattern);
}

