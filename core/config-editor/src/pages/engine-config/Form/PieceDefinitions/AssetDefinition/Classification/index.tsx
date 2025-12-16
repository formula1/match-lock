import type { InputProps } from "../../../../../../utils/react/input";
import { ToolTipSpan } from "../../../../../../components/ToolTip";
import type { MatchLockEngineConfig } from "@match-lock/shared";

import ClassificationTT from "./ClassificationTT.md";

type AssetDefinition = MatchLockEngineConfig["pieceDefinitions"][string]["assets"][number];

export function AssetClassificationInput({ value, onChange }: InputProps<AssetDefinition["classification"]>){
  return (
    <>
      <h3><ToolTipSpan tip={ClassificationTT} clickable >Classification</ToolTipSpan></h3>
      <div>
        <input
          type="radio"
          checked={value === "logic"}
          onChange={() => onChange("logic")}
        />
        <span>Logic</span>
      </div>
      <div>
        <input
          type="radio"
          checked={value === "media"}
          onChange={() => onChange("media")}
        />
        <span>Media</span>
      </div>
      <div>
        <input
          type="radio"
          checked={value === "doc"}
          onChange={() => onChange("doc")}
        />
        <span>Document</span>
      </div>
    </>
  );
}