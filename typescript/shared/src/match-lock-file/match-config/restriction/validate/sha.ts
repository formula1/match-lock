
import { MatchLockRestrictionConfig } from "../types";
import { canonicalJSONStringify } from "../../../../utils/JSON";
import { createSHA256Hash } from "../../../util-types";

export async function validateRestrictionSha(restriction: MatchLockRestrictionConfig){
  const predictableString = canonicalJSONStringify({
    name: restriction.name,
    version: restriction.version,
    published: restriction.published,

    engine: restriction.engine,
    pieces: restriction.pieces,
  });
  const sha = await createSHA256Hash(predictableString);
  if(sha !== restriction.sha256){
    throw new Error("Restriction's sha isn't equal to the expected")
  };
}
