import { ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA, MatchLockEngineConfig } from "@match-lock/shared";

import { createCurrentFileContext } from "../../../components/data/CurrentFileContext";

const { useCurrentFile, CurrentFileProvider } = createCurrentFileContext<MatchLockEngineConfig>(
  { name: "", version: "", pieceDefinitions: {} },
  ROSTERLOCK_ENGINE_CASTER_JSONSCHEMA.cast
);

export { useCurrentFile, CurrentFileProvider };
