
import { RosterConfigForm, RosterLegend } from "../Form";
import type { RosterLockEngineWithRosterConfig } from "@match-lock/shared";

import { FollowButtonForm } from "../../../components/FollowButtonForm";
import { InputProps } from "../../../utils/react";

export function NewPieceConfig(
  { value, onChange, onSave }: (
    & InputProps<RosterLockEngineWithRosterConfig>
    & { onSave: ()=>unknown }
  )
){
  return <div style={{ overflow: "hidden", flexGrow: 1 }}>
    <h1>New Roster Config</h1>
    <FollowButtonForm
      info={{
        title: "New Roster Config",
        note: <RosterLegend engineConfig={value} />,
      }}
      buttons={[
        {
          label: "Save",
          onClick: onSave
        }
      ]}
    >
      <RosterConfigForm value={value} onChange={onChange} />
    </FollowButtonForm>
  </div>
}
