import { nativeAPI } from "../tauri";

export const FS = {
  ...nativeAPI.fs,
  readJSON: (path: string) =>(
    nativeAPI.fs.readFile(path).then(data => JSON.parse(new TextDecoder().decode(data)))
  ),
  writeJSON: (path: string, data: any) =>(
    nativeAPI.fs.writeFile(path, new TextEncoder().encode(JSON.stringify(data, null, 2)))
  ),
};