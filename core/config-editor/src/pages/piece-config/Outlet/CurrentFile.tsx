import {
  ROSTERLOCK_ENGINE_WITH_ROSTER_CASTER_JSONSCHEMA,
  RosterLockEngineWithRosterConfig
} from "@match-lock/shared";

import { createCurrentFileContext } from "../../../components/data/CurrentFileContext";

const { useCurrentFile, CurrentFileProvider } = createCurrentFileContext<RosterLockEngineWithRosterConfig>(
  { engine: { name: "", version: "", pieceDefinitions: {} }, pieces: {} },
  ROSTERLOCK_ENGINE_WITH_ROSTER_CASTER_JSONSCHEMA.cast
);

export { useCurrentFile, CurrentFileProvider };
