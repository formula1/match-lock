import { ROSTERLOCK_V1_CASTER_JSONSCHEMA, RosterLockV1Config } from "@match-lock/shared";

import { createCurrentFileContext } from "../../../../components/data/CurrentFileContext";

const {
  useCurrentFile: useCurrentRosterLockFile,
  CurrentFileProvider: CurrentRosterLockFileProvider,
} = createCurrentFileContext<RosterLockV1Config>(
  {
    version: 1,
    engine: { name: "", version: "", pieceDefinitions: {} },
    rosters: {},
    selection: { piece: {} },
  },
  ROSTERLOCK_V1_CASTER_JSONSCHEMA.cast
);

export { useCurrentRosterLockFile, CurrentRosterLockFileProvider };

