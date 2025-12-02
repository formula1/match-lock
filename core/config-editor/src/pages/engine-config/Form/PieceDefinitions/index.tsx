import { useState } from "react";
import { type InputProps } from "../../../../utils/react/input";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { AssetDefinitionCreator, AssetDefinitionForm } from "./AssetDefinition";

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
function PieceDefinition(
  { pieceName, value: definitions, onChange: setDefinitions }: (
    & { pieceName: string }
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
  )
){
  const value = definitions[pieceName];
  const onChange = (v: typeof value) => setDefinitions({ ...definitions, [pieceName]: v });
  return <div className="section">
    <TitleInput
      pieceName={pieceName}
      value={definitions}
      onChange={setDefinitions}
    />
    <PathVariablesInput
      value={value.pathVariables}
      onChange={v => onChange({ ...value, pathVariables: v })}
    />
    <div className="section">
      <h3>Assets</h3>
      <AssetDefinitionCreator value={value} onChange={onChange} />
      {value.assets.map((asset, i) => (
        <div className="section" key={i}>
          <AssetDefinitionForm
            index={i}
            value={asset}
            onChange={v => onChange({ ...value, assets: value.assets.map((a, j) => j === i ? v : a) })}
            assetList={value.assets}
          />
        </div>
      ))}
    </div>
  </div>
}

function TitleInput(
  { pieceName, value: definitions, onChange: setDefinitions }: (
    & { pieceName: string }
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
  )
){
  const [title, setTitle] = useState(pieceName);
  const [error, setError] = useState<null | string>(null);
  return <div>
    <div className="editable-title">
      <input
        type="text"
        placeholder="Piece Title..."
        value={title}
        onChange={(e)=>{
          setTitle(e.target.value);
          setError(null);
          if(e.target.value === pieceName) return;
          if(e.target.value === "") return setError("Name cannot be empty");
          if(definitions[e.target.value]) return setError("Name already exists");
        }}
      />
      <button
        disabled={title === pieceName || error !== null}
        onClick={() => {
          try {
            if(title === pieceName) throw new Error("Name is the same");
            if(title === "") throw new Error("Name cannot be empty");
            if(definitions[title]) throw new Error("Name already exists");
            const def = definitions[pieceName];
            const oldValue = { ...definitions }
            delete oldValue[pieceName];
            setDefinitions({ ...oldValue, [title]: def });
            setTitle(pieceName);
          }catch(error){
            setError((error as Error).message);
          }
        }}
      >Update Title</button>
      <button
        onClick={() => {
          const { [pieceName]: _, ...oldValue } = definitions;
          setDefinitions(oldValue);
        }}
      >Delete</button>
    </div>
    {error !== null && <div className="error">{error}</div>}
  </div>
}

