#!/usr/bin/env node
import { Command } from 'commander';
import { SUPPORTED_PROTOCOLS, downloadToFolder } from './commands/download-to-folder';
import { runScript } from './commands/run-script';
import { stat as fsStat } from 'fs/promises';
import { resolve as pathResolve } from 'path';



const program = new Command();

program
  .name('Rosterlock Config Editor Sidecar')
  .description('Node.js sidecar for the Tauri config editor')
  .version('0.0.1');

program
  .command('download-to-folder')
  .description(
    [
      'Download from a source to a folder',
      'It supports the following protocols:',
      ...SUPPORTED_PROTOCOLS
    ].join('\n')
  )
  .requiredOption('-i, --input-url <url>', 'URL to download')
  .requiredOption('-o, --output-folder <path>', 'Output directory for downloaded files')
  .action(async (options)=>{
    const outputFolder = pathResolve(process.cwd(), options.outputFolder);
    const stat = await fsStat(outputFolder)
    if(!stat.isDirectory()){
      throw new Error("Output folder is not a directory");
    }
    await downloadToFolder(options.inputUrl, outputFolder);
  });

program
  .command('run-script')
  .description('Validate a script configuration')
  .argument('<path>', 'Script path')
  .action(async (path)=>{
    path = pathResolve(process.cwd(), path);
    const stat = await fsStat(path)
    if(stat.isDirectory()){
      throw new Error("Path is a directory");
    }
    runScript();
  });

program.parse();
