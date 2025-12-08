import { useState, useEffect } from "react";
import type { MatchLockEngineAssetDefinition, MatchLockEngineConfig } from "@match-lock/shared";
import { WINDOW } from "../../../../globals/window";
import {
  type FileTestResult,
  type TestStatistics, DEFAULT_TEST_STATISTICS,
  type CountViolation,
  scanFolder,
} from "./utils";
import { ToolTipSpan } from "../../../../components/ToolTip";

import { PathVariablesInput } from "./PathVariablesInput";

import { useCurrentFile } from "../../Outlet/CurrentFile";
export function EngineTest(){
  const currentFile = useCurrentFile();
  const [folder, setFolder] = useState<string | null>(null);
  const [pieceName, setPieceName] = useState<string | null>(null);
  const [pathVariables, setPathVariables] = useState<Record<string, string>>({});

  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<FileTestResult[]>([]);
  const [statistics, setStatistics] = useState<TestStatistics>({ ...DEFAULT_TEST_STATISTICS });
  const [countViolations, setCountViolations] = useState<Record<string, CountViolation>>({});


  if(!currentFile.activeFile){
    return <div>No active file</div>
  }
  if(currentFile.state !== "ready"){
    return <div>Loading...</div>
  }

  const { config: engineConfig } = currentFile;

  const pieceNames = Object.keys(engineConfig.pieceDefinitions);
  const pieceDef = pieceName && engineConfig.pieceDefinitions[pieceName];

  // Set default piece name if none selected
  useEffect(() => {
    if (!pieceName && pieceNames.length > 0) {
      setPieceName(pieceNames[0]);
    }
  }, [pieceName, pieceNames]);

  return <div>
    <h1>Engine Test</h1>

    <div>
      <button
        onClick={async ()=>{
          const { canceled, filePaths } = await WINDOW.showOpenDialog({
            title: 'Select Folder to Test',
            properties: ['openDirectory'],
            filters: []
          })
          if(canceled) return;
          if(filePaths.length === 0) return;
          const folderPath = filePaths[0];
          setFolder(folderPath);
          setResults([]);
          setStatistics({ ...DEFAULT_TEST_STATISTICS });
          setCountViolations({});
        }}
        disabled={isScanning}
      >
        {folder ? 'Change Folder...' : 'Select Folder...'}
      </button>
      {folder && <div>Selected: {folder}</div>}
    </div>

    <div>
      <label>
        Piece Type:
        <select
          value={pieceName || ''}
          onChange={(e)=>(setPieceName(e.target.value))}
          disabled={isScanning}
        >
          {pieceNames.map((name)=>(
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>
    </div>

    {pieceDef && pieceDef.pathVariables.length > 0 && (
      <PathVariablesInput
        value={pathVariables}
        onChange={v => setPathVariables(v)}
        pathVariables={pieceDef.pathVariables}
      />
    )}

    {folder && pieceName && (
      <div>
        <button
          onClick={async () =>{
            setIsScanning(true);

            try {
              await scanFolder(
                folder, pieceName, engineConfig, pathVariables,
                setResults,
                setStatistics,
                setCountViolations,
              )
            } catch (error) {
              console.error('Error during scan:', error);
              alert(`Error during scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              setIsScanning(false);
            }

          }}
          disabled={isScanning}
        >
          {isScanning ? 'Scanning...' : 'Start Test'}
        </button>
      </div>
    )}

    {isScanning && <div>Scanning folder...</div>}

    {results.length > 0 && (
      <div>
        <h2>Statistics</h2>
        <div>
          <div>Total Files: {statistics.totalFiles}</div>
          <div>Logic Files: {statistics.logicFiles}</div>
          <div>Media Files: {statistics.mediaFiles}</div>
          <div>Doc Files: {statistics.docFiles}</div>
          <div>Unmatched Files: {statistics.unmatchedFiles}</div>
          <div>Total Size: {formatBytes(statistics.totalBytes)}</div>
          <div>Logic Size: {formatBytes(statistics.logicBytes)}</div>
          <div>Media Size: {formatBytes(statistics.mediaBytes)}</div>
          <div>Doc Size: {formatBytes(statistics.docBytes)}</div>
        </div>
      </div>
    )}

    {results.length > 0 && (
      <div>
        <h2>File Results</h2>
        <table>
          <thead>
            <tr>
              <th>File Path</th>
              <th>Matched Asset</th>
              <th>Classification</th>
              <th>Count Violations</th>
              <th>Total Matched Assets</th>
              <th>File Size</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => {
              const matchedAsset = result.matchedAssets[0];
              const assetCountViolations = (
                !matchedAsset ? "None" :
                countViolations[matchedAsset.name].violation || "None"
              );
              return <tr key={index}>
                <td>{result.relativePath}</td>
                <td>{!matchedAsset ? 'None' : matchedAsset.name}</td>
                <td>{!matchedAsset ? 'N/A' : matchedAsset.classification}</td>
                <td>{assetCountViolations}</td>
                <td>
                  {!matchedAsset ? 0 : (
                    <ToolTipSpan
                      tip={assetsToMD(result.matchedAssets)}
                    >{result.matchedAssets.length}</ToolTipSpan>
                  )}
                </td>
                <td>{formatBytes(result.fileSize)}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
}

function assetsToMD(assets: MatchLockEngineAssetDefinition[]){
  return `All Matched Assets:\n${assets.map((asset, i)=>(
    `- ${asset.name} - ${asset.classification}${i === 0 ? ' (Active Asset)' : ''}`
  )).join('\n')}`;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

