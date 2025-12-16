
import { JSONSchemaType } from "ajv";
import { requirementListSchemaValidator, requirementItemSchemaValidator, requirementCycleSchemaValidator } from "./keywords";
import { MatchLockEngineConfig } from "../../types";

export { requirementCycleSchemaValidator };

export const requirementKeywords = [
  requirementListSchemaValidator,
  requirementItemSchemaValidator,
  requirementCycleSchemaValidator,
]


export const requirementsSchema: JSONSchemaType<MatchLockEngineConfig["pieceDefinitions"][string]["requires"]> = {
  [requirementListSchemaValidator.keyword]: true,
  [requirementCycleSchemaValidator.keyword]: true,
  type: "array",
  items: {
    [requirementItemSchemaValidator.keyword]: true,
    type: "string",
  },
}
