
import { PieceValue } from "../../types";
import { InputProps } from "../../../../../../utils/react";
import { ToolTipSpan } from "../../../../../../components/ToolTip";
import { ValidatingTextInput } from "../../../../../../components/inputs/ValidatingTextInput";


import {
  DOWNLOADABLE_SOURCE_PROTOCOLS,
  validateDownloadableSource
} from "@match-lock/shared";
import downloadSourcesTTRAW from "./downloadSourcesTT.md";
let downloadSourcesTT = downloadSourcesTTRAW;
downloadSourcesTT += "\n\n" + DOWNLOADABLE_SOURCE_PROTOCOLS.map((v) => `- ${v.protocol}`).join('\n');

export function DownloadSources({ value, onChange }: (
  & InputProps<PieceValue["downloadSources"]>
)){
  return (
    <div className="section">
      <div><ToolTipSpan tip={downloadSourcesTT}>Download Sources</ToolTipSpan></div>
      {value.length === 0 && <div className="error">At least one source is required</div>}
      {value.length > 1 && (
        <div>
          {value.map((source, index) => (
            <div key={index}>
              <button
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >Remove</button>
              <ValidatingTextInput
                value={source}
                onChange={v => onChange(value.map((oldSource, i) => i !== index ? oldSource : v))}
                validate={validateDownloadableSource}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
