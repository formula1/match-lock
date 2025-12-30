
import { JSONSchemaType } from "ajv";
import { requirementListSchemaValidator, requirementItemSchemaValidator, requirementCycleSchemaValidator } from "./keywords";
import { RosterLockEngineConfig } from "../../types";

export { requirementCycleSchemaValidator };

export const requirementKeywords = [
  requirementListSchemaValidator,
  requirementItemSchemaValidator,
  requirementCycleSchemaValidator,
]


export const requirementsSchema: JSONSchemaType<
  RosterLockEngineConfig["pieceDefinitions"][string]["requires"]
> = {
  [requirementListSchemaValidator.keyword]: true,
  [requirementCycleSchemaValidator.keyword]: true,
  type: "array",
  items: {
    [requirementItemSchemaValidator.keyword]: true,
    type: "string",
  },
}
