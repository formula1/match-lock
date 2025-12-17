import { RosterLockEngineWithRosterConfig } from "../types";
import { validateURL } from "./utils";


export function validateHumanInfo(
  humanInfo: RosterLockEngineWithRosterConfig["pieces"][string][0]["humanInfo"]
){
  validateFriendlyString(humanInfo.name);
  validateFriendlyString(humanInfo.author);
  validateURL(humanInfo.url);
  if(humanInfo.image) validateURL(humanInfo.image);
}

export function validateFriendlyString(value: string){
  if(!value.trim()) throw new Error("String is required");
  if(value.length > 100) throw new Error("String is too long");
  if(value.length < 3) throw new Error("String is too short");
}
