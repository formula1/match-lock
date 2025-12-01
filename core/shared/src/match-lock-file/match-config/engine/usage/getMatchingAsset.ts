import micromatch from "micromatch";
import type {
  MatchLockEngineConfig,
} from '../types';

/**
 * Test a single file against piece definition assets
 */
export function getMatchingAssetsForFile(
  pieceDefinition: MatchLockEngineConfig['pieceDefinitions'][string],
  relativePath: string,
): Array<MatchLockEngineConfig['pieceDefinitions'][string]['assets'][number]> {
  return pieceDefinition.assets.filter((asset) =>(
    asset.glob.some((glob)=>(
      // check if the relativePath is exactly the glob
      relativePath === glob || 
      // or check if the relativePath matches the glob
      micromatch.isMatch(relativePath, glob)
    ))
  ));
}
