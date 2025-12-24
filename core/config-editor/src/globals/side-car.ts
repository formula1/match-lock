import { Command } from '@tauri-apps/plugin-shell';

export const ROSTERLOCK_SIDECAR = {
  downloadSource: async function(url: string, destinationFolder: string): Promise<void> {
    const instance = Date.now().toString(32);
    const command = Command.sidecar(
      'binaries/node-sidecar', [
        'download-to-folder',
        '--input-url', url,
        '--output-folder', destinationFolder
      ]
    );
    command.stdout.on('data', line => console.log("sidecar stdout", instance +":", line));
    command.stderr.on('data', line => console.log("sidecar stderr", instance +":", line));

    const output = await command.execute();

    if (output.code !== 0) {
      throw new Error(output.stderr);
    }

  },
  runScript: async function(script: string, type: string): Promise<void> {
    const command = Command.sidecar(
      'binaries/node-sidecar', [
        'run-script',
        '--script', script,
        '--type', type
      ]
    );
    const output = await command.execute();

    if (output.code !== 0) {
      throw new Error(output.stderr);
    }
  }
}
