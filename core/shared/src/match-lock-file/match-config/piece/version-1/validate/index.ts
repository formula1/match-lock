import { RosterLockEngineWithRosterConfig } from "../types";

export * from "./downloadable-source";
export * from "./path-variables";
export * from "./required-pieces";
export * from "./utils";

import { validateVersions } from "./version";
import { validateHumanInfo } from "./human";
import { validateDownloadableSource } from "./downloadable-source";
import {
  validateAllExpectedPathVariableNamesSet,
  validatePathVariableNameIsExpected,
  validatePathVariableValue,
} from "./path-variables";
import {
  validateAllExpectedRequiredPieceTypesSet,
  validateRequiredPieceType,
  validateRequiredPieceValue,
} from "./required-pieces";
export function validateRosterLockPieces(
  { engine, pieces }: RosterLockEngineWithRosterConfig
){
  for(const [pieceType, pieceList] of Object.entries(pieces)){
    for(const piece of pieceList){
      const pieceConfig = engine.pieceDefinitions[pieceType];
      if(!pieceConfig)
        throw new Error(`Piece type ${pieceType} is not defined in engine`);
      validateVersions(piece.version);
      validateHumanInfo(piece.humanInfo);
      // Download Sources
      for(const downloadSource of piece.downloadSources){
        validateDownloadableSource(downloadSource);
      }

      // Path Variables
      validateAllExpectedPathVariableNamesSet(piece.pathVariables, pieceConfig);
      for(const [variableName, variableValue] of Object.entries(piece.pathVariables)){
        validatePathVariableNameIsExpected(variableName, pieceConfig);
        validatePathVariableValue(variableValue);
      }

      // Required Pieces
      validateAllExpectedRequiredPieceTypesSet(piece.requiredPieces, pieceConfig);
      for(const [requiredPieceType, requiredPiece] of Object.entries(piece.requiredPieces)){
        validateRequiredPieceType(requiredPieceType, { engine, pieces });
        for(const pieceSha of requiredPiece.expected){
          validateRequiredPieceValue(requiredPieceType, pieceSha, pieces[requiredPieceType]);
        }
      }
    }
  }
}
