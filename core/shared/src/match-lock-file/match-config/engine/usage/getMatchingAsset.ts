import micromatch from "micromatch";
import type {
  MatchLockEngineConfig,
} from '../types';

import { validatePathVariableValues } from "../../piece/validate/definition/pathVariables";
/**
 * Test a single file against piece definition assets
 */
export function getMatchingAssetsForFile(
  pieceDefinition: MatchLockEngineConfig['pieceDefinitions'][string],
  pathVariables: Record<string, string>,
  relativePath: string,
): Array<MatchLockEngineConfig['pieceDefinitions'][string]['assets'][number]> {

  validatePathVariableValues(pieceDefinition, pathVariables);

  return pieceDefinition.assets.filter((asset) =>(
    asset.glob.some((glob)=>{
      // Replace path variables
      glob = replacePathVariables(glob, pathVariables);
      // check if the relativePath is exactly the glob
      if(relativePath === glob) return true;
      // check if the relativePath matches the glob
      if(micromatch.isMatch(relativePath, glob)) return true;
      return false;
    })
  ));
}

function replacePathVariables(
  glob: string, pathVariables: Record<string, string>
){
  for(const [variableName, value] of Object.entries(pathVariables)){
    glob = glob.replaceAll(`<${variableName}>`, value);
  }
  return glob;
}
