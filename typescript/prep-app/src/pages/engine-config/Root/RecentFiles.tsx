import { Link } from "react-router-dom";
import { useRecentFiles } from "../services/RecentFilesStorage";
import { replaceParams } from "../../../utils/router";
import { EngineConfigPaths } from "../paths";

export function RecentFiles(
  { maxDisplay }: { maxDisplay?: number }
) {
  const {
    value: recentFiles, loading, error,
    removeRecentFile,
    clearRecentFiles,
  } = useRecentFiles();

  if (loading) {
    return <div>Loading recent files...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading recent files: {error}</p>
      </div>
    );
  }
  if (!recentFiles || recentFiles.length === 0) {
    return (
      <div>
        <p>No recent files</p>
      </div>
    );
  }


  const displayFiles = maxDisplay ? recentFiles.slice(0, maxDisplay) : recentFiles;

  return (
    <div>
      <div>
        <h3>Recent Files</h3>
        <button 
          onClick={()=>{
            if (confirm('Are you sure you want to clear all recent files?')) {
              clearRecentFiles();
            }
          }}
          title="Clear all recent files"
        >
          Clear All
        </button>
      </div>
      
      <div>
        {displayFiles.map((file, index) => (
          <div
            key={`${file.path}-${index}`}
            title={file.path}
          >
            <div className="file-info">
              <Link to={
                replaceParams(EngineConfigPaths.edit, { enginePath: encodeURIComponent(file.path) })
              } >
                <div className="file-name">{file.name}</div>
                <div className="file-path">{file.path}</div>
              </Link>
              <div className="file-date">
                Last opened: {formatDate(file.lastOpened)}
              </div>
              {file.type && (
                <div className="file-type">Type: {file.type}</div>
              )}
            </div>
            
            <button
              onClick={(e) =>{
                e.stopPropagation();
                removeRecentFile(file.path);
              }}
              title="Remove from recent files"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {maxDisplay && recentFiles.length > maxDisplay && (
        <div className="recent-files-footer">
          <p>Showing {maxDisplay} of {recentFiles.length} recent files</p>
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string){
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return 'Unknown';
  }
};
