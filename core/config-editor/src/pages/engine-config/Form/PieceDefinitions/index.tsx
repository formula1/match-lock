import { useState } from "react";
import { type InputProps } from "../../../../utils/react/input";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { ToolTipSpan } from "../../../../components/ToolTip";
import tooltip from "./piecett.md";

import { ENGINECONFIG_ID } from "../../paths";

export function PieceDefinitions(
  { value, onChange, engineConfig }: (
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
    & { engineConfig: MatchLockEngineConfig }
  )
){
  return <div className="section">
    <h2><ToolTipSpan tip={tooltip} clickable>Piece Definitions</ToolTipSpan></h2>
    <PieceDefinitionCreator value={value} onChange={onChange} />
    <div className="alternate-list">
    {Object.keys(value).sort().map((pieceName) => (
      <div key={pieceName} className="section" id={ENGINECONFIG_ID.pieceId(pieceName)} >
        <PieceDefinition
          pieceName={pieceName}
          value={value}
          onChange={onChange}
          engineConfig={engineConfig}
        />
      </div>
    ))}
    </div>
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
          onChange({
            ...value,
            [name]: {
              selectionStrategy: "personal",
              requires: [],
              pathVariables: [],
              assets: []
            }
          });
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

import { SelectionStrategyInput } from "./SelectionStrategyInput";
import { RequiresInput } from "./RequiresInput";
import { PathVariableNamesInput } from "./PathVariablesInput";
import { AssetsInput } from "./AssetDefinition";
function PieceDefinition(
  { pieceName, engineConfig, value: definitions, onChange: setDefinitions }: (
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
    & { pieceName: string, engineConfig: MatchLockEngineConfig }
  )
){
  const value = definitions[pieceName];
  const onChange = (v: typeof value) => setDefinitions({ ...definitions, [pieceName]: v });
  return <>
    <PieceTitleInput
      pieceName={pieceName}
      value={definitions}
      onChange={setDefinitions}
    />
    <div className="section">
      <SelectionStrategyInput
        value={value.selectionStrategy}
        onChange={v => onChange({ ...value, selectionStrategy: v })}
      />
    </div>
    <div className="section">
      <RequiresInput
        value={value.requires}
        onChange={v => onChange({ ...value, requires: v })}
        pieceName={pieceName}
        engineConfig={engineConfig}
      />
    </div>
    <div className="section">
      <PathVariableNamesInput
        value={value.pathVariables}
        onChange={v => onChange({ ...value, pathVariables: v })}
      />
    </div>
    <div className="section">
      <AssetsInput
        value={value.assets}
        onChange={v => onChange({ ...value, assets: v })}
        pathVariables={value.pathVariables}
      />
    </div>
  </>
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
    validate={name => {
      if(Object.keys(definitions).includes(name)) throw new Error("Name already exists");
    }}
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

