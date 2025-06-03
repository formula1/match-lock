import { canonicalJSONStringify } from "../../../../utils/JSON";
import { MatchLockPublishPiece } from "../types";


import { createHash } from "node:crypto";
export function validatePublishPieceSha(piece: MatchLockPublishPiece){
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
  const sha = createHash("sha256")
  .update(predictableString, "utf8")
  .digest("hex");

  if(sha !== piece.sha256){
    throw new Error("Restriction's sha isn't equal to the expected")
  };
}
