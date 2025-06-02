
import {
  UserId,
  CollectionId, PieceId,
} from "../../config-types";

import {
  SignedContent,
  SemVer,
  Sha256,
} from "../../util-types";


export type MatchLockSelectionConfig = {
  roomId: string,
  restriction: {
    name: string,
    version: SemVer,
    sha256: Sha256,
  }
  ownerId: UserId,
  selections: Record<CollectionId, Array<PieceId>>
  signatures: Record<UserId, SignedContent>
}
