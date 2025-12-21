
import { Link } from "react-router-dom";
import { RosterConfigPaths } from "../paths";
import { RecentFiles } from "./RecentFiles";
import { OpenFile } from "./OpenFile";

export function EngineRoot(){

  return (
    <div style={{ padding: '20px' }}>
      <h1>Roster Config</h1>

      <div style={{ marginBottom: '30px' }}>
        <h2>Create New Roster Config</h2>
        <Link to={RosterConfigPaths.new}>
          <button>Create New</button>
        </Link>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Open Existing Config</h2>
        <OpenFile />
      </div>

      <div>
        <RecentFiles />
      </div>
    </div>
  )
}
