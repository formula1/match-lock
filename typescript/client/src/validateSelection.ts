
import { MatchLockSelectionConfig, canonicalJSONStringify } from "@match-lock/shared";
import { createVerify } from "node:crypto";

// You must map playerId -> publicKey externally
import { UserId, PublicKey } from "@match-lock/shared";

export type PublicKeyMap = Record<UserId, PublicKey>;

export function validateSignedSelection(
  data: MatchLockSelectionConfig,
  publicKeys: PublicKeyMap
): boolean {
  const canonicalMessage = canonicalJSONStringify({
    roomId: data.roomId,
    restriction: data.restriction,
    ownerId: data.ownerId,
    selections: data.selections,
  });

  for (const [signerId, signature] of Object.entries(data.signatures)) {
    const pubKey = publicKeys[signerId];
    if(!pubKey) return false;

    const verifier = createVerify("SHA256");
    verifier.update(canonicalMessage);
    verifier.end();

    const isValid = verifier.verify(pubKey, signature, "base64");
    if (!isValid) return false;
  }
  return true;
}
