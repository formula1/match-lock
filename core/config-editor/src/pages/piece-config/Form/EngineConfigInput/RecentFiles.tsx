import { RECENT_ENGINE_FILES_KEY } from "../../../engine-config/constants";
import { useRecentFiles } from "../../../../globals/recent-files";

export function RecentFiles({ onSelect }: { onSelect: (file: string) => void }){
  const {
    value: recentFiles, loading, error,
    removeRecentFile,
    clearRecentFiles,
  } = useRecentFiles(RECENT_ENGINE_FILES_KEY);

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

  return (
    <>
    <h3>Recent Files</h3>
    <ul>
      {recentFiles.map((file) => (
        <li key={file.path}>
          <button
            onClick={() => {
              onSelect(file.path);
            }}
          >
            {file.path}
          </button>
        </li>
      ))}
    </ul>
    </>
  );
}
