import { useState } from "react";
import { type InputProps } from "../../../../utils/react/input";
import type { MatchLockEngineConfig } from "@match-lock/shared";

export function PieceDefinitions({ value, onChange }: InputProps<MatchLockEngineConfig["pieceDefinitions"]>){
  return <div className="section">
    <h2>Piece Definitions</h2>
    <PieceDefinitionCreator value={value} onChange={onChange} />
    {Object.keys(value).sort().map((pieceName) => (
      <PieceDefinition
        key={pieceName}
        pieceName={pieceName}
        value={value}
        onChange={onChange}
      />
    ))}
  </div>
}

function PieceDefinitionCreator({ value, onChange }: InputProps<MatchLockEngineConfig["pieceDefinitions"]>){
  const [name, setName] = useState("");
  const [error, setError] = useState<null | string>(null);
  return (
    <form
      className="section"
      onSubmit={(e)=>{
        e.preventDefault();
        try {
          setError(null);
          if(name === "") throw new Error("Name cannot be empty");
          if(value[name]) throw new Error("Name already exists");
          onChange({ ...value, [name]: { pathVariables: [], assets: [] } });
          setName("");
        }catch(error){
          setError((error as Error).message);
        }
      }}
    >
      <h3>Create Piece Definition</h3>
      <div>
        <input
          type="text" placeholder="Piece Name..."
          value={name}
          onChange={(e)=>{
            setName(e.target.value)
            setError(null);
            if(value[e.target.value]) return setError("Name already exists");
          }}
        />
        <button
          disabled={!!error || name === ""}
          type="submit"
        >Create</button>
      </div>
      {error !== null && <div className="error">{error}</div>}
    </form>
  )
}

import { PathVariablesInput } from "./PathVariablesInput";
import { AssetsInput } from "./AssetDefinition";
function PieceDefinition(
  { pieceName, value: definitions, onChange: setDefinitions }: (
    & { pieceName: string }
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
  )
){
  const value = definitions[pieceName];
  const onChange = (v: typeof value) => setDefinitions({ ...definitions, [pieceName]: v });
  return <div className="section">
    <PieceTitleInput
      pieceName={pieceName}
      value={definitions}
      onChange={setDefinitions}
    />
    <div className="section">
      <PathVariablesInput
        value={value.pathVariables}
        onChange={v => onChange({ ...value, pathVariables: v })}
      />
    </div>
    <div className="section">
      <AssetsInput
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
}

import { TitleInput } from "../../../../components/TitleInput";
function PieceTitleInput(
  { pieceName, value: definitions, onChange: setDefinitions }: (
    & { pieceName: string }
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
  )
){
  return <TitleInput
    placeholder="Piece Title..."
    originalValue={pieceName}
    existingNames={Object.keys(definitions)}
    validate={name => {}}
    onSubmit={name => {
      const def = definitions[pieceName];
      const oldValue = { ...definitions }
      delete oldValue[pieceName];
      setDefinitions({ ...oldValue, [name]: def });
    }}
    onDelete={() => {
      const { [pieceName]: _, ...oldValue } = definitions;
      setDefinitions(oldValue);
    }}
  />
}

