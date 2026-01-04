import { canonicalJSONStringify } from "../../../../../utils/JSON";
import { MatchLockPublishPiece } from "../types";
import { createSHA256Hash } from "../../../../util-types/runtypes";


export async function validatePublishPieceSha(piece: MatchLockPublishPiece){
  const predictableString = canonicalJSONStringify({
    name: piece.name,
    author: piece.author,
    published: piece.published,
    preview: piece.preview,
    sources: piece.sources,

    pieceDefinition: piece.pieceDefinition,
    version: piece.version,
    assets: piece.assets,
  });
  const sha = await createSHA256Hash(predictableString);

  if(sha !== piece.sha256){
    throw new Error("Restriction's sha isn't equal to the expected")
  };
}
