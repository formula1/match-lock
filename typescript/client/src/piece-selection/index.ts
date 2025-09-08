import { MatchLockRestrictionConfig } from "@match-lock/shared";

import { Room } from "../types/room";
import { errorWrapper } from "./errorWrapper";
import { handleRoomSelections } from "./handleRoomSelections";
import { PlayerSelection } from "./steps/player-selection";

export async function handleSelection(
  room: Room,
  restriction: MatchLockRestrictionConfig,
  selection: PlayerSelection
){
  await errorWrapper(
    room,
    handleRoomSelections(room, restriction, selection)
  );
}

