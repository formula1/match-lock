import { SimpleMessenger, handleRequest, makeTrigger } from "@match-lock/shared";
import { MatchLockSelectionConfig, MatchLockGamePieceCaster } from "@match-lock/shared";
import { JSON_Unknown } from "@match-lock/shared/src/utils/JSON";

import {
  Object as CastObject,
  String as CastString,
  Unknown as CastUnknown
} from "runtypes";

import { availableGamePiece } from "./availableGamePiece";

export function handleConnection(
  parentDirectory: string,
  connection: SimpleMessenger,
  privateKey: string,
  selection: MatchLockSelectionConfig,
){
  handleRequest(connection, "privateKey", async ()=>{
    return privateKey;
  })
  handleRequest(connection, "selection", async ()=>{
    return selection;
  })
  handleRequest(connection, "start-piece", async (data)=>{
    const piece = MatchLockGamePieceCaster.check(data);
    await availableGamePiece(piece, parentDirectory, (progress)=>{
      makeTrigger(connection, "piece-progress", progress);
    });
    return piece.id;
  })
  handleRequest(connection, "finished", async ()=>{
    return true;
  })
}

function pieceDirectory(){
  
}