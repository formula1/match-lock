import { RosterLockEngineWithRosterConfig } from "../types";
import { validateURL } from "./utils";


export function validateHumanInfo(
  humanInfo: RosterLockEngineWithRosterConfig["pieces"][string][0]["humanInfo"]
){
  if(!humanInfo.name.trim()) throw new Error("Human Info Name is required");
  if(!humanInfo.author.trim()) throw new Error("Human Info Author is required");
  validateURL(humanInfo.url);
  if(humanInfo.image) validateURL(humanInfo.image);
}
