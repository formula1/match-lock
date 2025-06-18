import { useState } from "react";
import { type InputProps } from "../../../../utils/react/input";
import type { MatchLockEngineConfig } from "@match-lock/shared";
import { AssetDefinitionForm } from "./AssetDefintion";

export function PieceDefinitions({ value, onChange }: InputProps<MatchLockEngineConfig["pieceDefinitions"]>){
  return <div>
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
  return (
    <div>
      <h3>Create Piece Definition</h3>
      <div>Piece Name</div>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => onChange({ ...value, [name]: { assets: [] } })}>Create</button>
    </div>
  )
}

function PieceDefinition(
  { pieceName, value: definitions, onChange: setDefinitions }: (
    & { pieceName: string }
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
  )
){
  const value = definitions[pieceName];
  const onChange = (v: typeof value) => setDefinitions({ ...definitions, [pieceName]: v });
  return <div>
    <h3>
      <TitleInput
        pieceName={pieceName}
        value={definitions}
        onChange={setDefinitions}
      />
    </h3>
    <div>
      <h3>Assets</h3>
    </div>
    <AssetDefinitionCreator value={value} onChange={onChange} />
    {value.assets.map((asset, i) => (
      <AssetDefinitionForm
        key={`${asset.name}-${i}`}
        value={asset}
        onChange={v => onChange({ ...value, assets: value.assets.map((a, j) => j === i ? v : a) })}
        assetList={value.assets}
      />
    ))}
  </div>
}

function TitleInput(
  { pieceName, value: definitions, onChange: setDefinitions }: (
    & { pieceName: string }
    & InputProps<MatchLockEngineConfig["pieceDefinitions"]>
  )
){
  const [title, setTitle] = useState(pieceName);
  return <>
    <input
      type="text"
      value={pieceName}
      onChange={(e)=>{
        setTitle(e.target.value);
      }}
    />
    <button
      onClick={() => {
        const def = definitions[pieceName];
        const oldValue = { ...definitions }
        delete oldValue[pieceName];
        setDefinitions({ ...oldValue, [title]: def });
      }}
    >Update Title</button>
  </>
}

function AssetDefinitionCreator({ value, onChange }: InputProps<MatchLockEngineConfig["pieceDefinitions"][string]>){
  const [asset, newAsset] = useState<MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number]>({
    name: "",
    classification: "logic",
    count: 1,
    glob: [],
  });
  return <div>
    <h3>
      <button
        onClick={() => onChange({ ...value, assets: [...value.assets, asset] })}
      >Add New Asset</button>
    </h3>
    <AssetDefinitionForm
      assetList={value.assets}
      value={asset}
      onChange={newAsset}
    />
  </div>
}
