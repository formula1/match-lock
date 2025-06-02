
import { createHash } from "node:crypto";
import { MatchLockRestrictionConfig } from "../types";
import { canonicalJSONStringify } from "../../../utils/JSON";

export function validateRestrictionSha(restriction: MatchLockRestrictionConfig){
  const predictableString = canonicalJSONStringify({
    name: restriction.name,
    version: restriction.version,
    published: restriction.published,

    engine: restriction.engine,
    pieces: restriction.pieces,
    sharedAssets: restriction.sharedAssets,
  });
  const sha = createHash("sha256")
    .update(predictableString, "utf8")          // feed the UTF‑8 bytes
    .digest("hex");                 // output as hexadecimal
  if(sha !== restriction.sha256){
    throw new Error("Restriction's sha isn't equal to the expected")
  };
}
