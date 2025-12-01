
import {
  MatchLockRestrictionConfig,
  MatchLockSelectionConfig,
  GamePiece
} from "@match-lock/shared";
import { PublicKeyMap, validateSignedSelection } from "./validateSelection";

import { handleConnection } from "./handleConnection";


export function prepareGame(){
  
  return new MatchLockPrepare();
}

class MatchLockPrepare extends Promise<boolean> {
  constructor(
    public pieceFolder: string,
    public roomClient: RoomClient,
    public restrictionConfig: MatchLockRestrictionConfig,
    public userSelection: MatchLockSelectionConfig
  ) {
    super((res, rej)=>{
      Promise.resolve().then(async ()=>{
        const { publicKeys } = await roomClient.getUsers();

      }).then(()=>{
        res(true);
      }, rej)
    });
  }
}

import { ISimpleEventEmitter } from "@match-lock/shared";

interface RoomClient {
  getUsers(): Promise<{ publicKeys: PublicKeyMap }>
  sendSelection(selection: MatchLockSelectionConfig): Promise<boolean>
  recieveSelection: ISimpleEventEmitter<[MatchLockSelectionConfig]>
  onDestroy: ISimpleEventEmitter<[MatchLockSelectionConfig]>
}

interface ClientConnection{
  handlePrivateKey(): Promise<string>
  handleSelection(): Promise<MatchLockSelectionConfig>
  onPiece: ISimpleEventEmitter<[GamePiece]>
  sendPieceProgress(pieceId: string, part: "logic" | "media", progress: number): Promise<void>
  onFinished(): Promise<void>

  onClose: ISimpleEventEmitter<[reason?: string]>

  connect(): void
}


interface DownloadProgress {
  onProgress: ISimpleEventEmitter<[number]>
  onFinished: ISimpleEventEmitter<[]>
}

function downloadPiece(restriction: MatchLockRestrictionConfig, peice: GamePiece): DownloadProgress {
  


}

function resolveDownloadable(url: string){


}
