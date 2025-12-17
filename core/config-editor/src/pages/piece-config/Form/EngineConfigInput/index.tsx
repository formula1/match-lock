import { MatchLockEngineConfig, ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA } from "@match-lock/shared";
import { InputProps } from "../../../../utils/react";
import { useCallback, useState } from "react";
import { FS } from "../../../../globals/fs";

import { OpenFile } from "./OpenFile";
import { RecentFiles } from "./RecentFiles";
export function EngineConfigInput({ value, onChange }: InputProps<null | MatchLockEngineConfig>) {
  const [displayRecent, setDisplayRecent] = useState(false);
  const [errors, setErrors] = useState<null | Array<{ path: string, message: string }>>(null);

  const loadFile = useCallback(async (filePath: string) => {
    setErrors(null);
    const json = await FS.readJSON(filePath);
    const result = ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA.safeCast(json, true);
    if(!result.valid){
      setErrors(result.error.map(e => ({ path: e.instancePath, message: e.message || "Unknown Error" })));
      return;
    }
    onChange(result.value);
    setDisplayRecent(false);
  }, [onChange, setErrors, setDisplayRecent]);

  return <div className="section" >
    <h2>Engine Config</h2>
    <ErrorsDisplay errors={errors} />
    <div>
      <OpenFile onSelect={loadFile} />
    </div>
    {value && <EngineDisplay value={value} />}
    <div>
      <div>
        <button onClick={() => setDisplayRecent(!displayRecent)}>
          {displayRecent ? 'Hide' : 'Show'} Recent Files
        </button>
      </div>
      {displayRecent && <RecentFiles onSelect={loadFile} />}
    </div>
  </div>;
}




import { ROSTERCONFIG_ID } from "../../paths";
function EngineDisplay({ value }: { value: MatchLockEngineConfig }){
  return <div>
    <div>{value.name}: {value.version}</div>
    <div>
      <h4>Pieces</h4>
      <ul>
        {Object.keys(value.pieceDefinitions).map((pieceName) => (
          <li key={pieceName}>
            <a href={`#${ROSTERCONFIG_ID.pieceTypeId(pieceName)}`}>{pieceName}</a>
          </li>
        ))}
      </ul>
    </div>
  </div>;
}

function ErrorsDisplay({ errors }: { errors: null | Array<{ path: string, message: string }> }){
  if(!errors) return null;
  return <ul>
    {errors.map((error, index) => (
      <li key={index}>
        <div className="error">{error.path}</div>
        <div className="error">{error.message}</div>
      </li>
    ))}
  </ul>;
}
