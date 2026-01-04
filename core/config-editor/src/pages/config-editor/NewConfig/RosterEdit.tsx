

import { RosterConfigForm, PieceRosterLegend } from "../Form";

import { FollowButtonForm } from "../../../components/FollowButtonForm";
import { useSaveFile } from "./data/saveFile";
import { useNewConfig } from "./data/Config";

export function NewRosterConfig(){
  const { value, onChange } = useNewConfig();
  const saveFile = useSaveFile();
  return <div style={{ overflow: "hidden", flexGrow: 1 }}>
    <h1>New Roster Config</h1>
    <FollowButtonForm
      info={{
        title: "New Roster Config",
        note: <PieceRosterLegend rosters={value.rosters} />,
      }}
      buttons={[
        {
          label: "Save",
          onClick: saveFile,
        }
      ]}
    >
      <RosterConfigForm value={value} onChange={onChange} />
    </FollowButtonForm>
  </div>
}
