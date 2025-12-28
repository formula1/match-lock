import { RosterLockV1Config } from "../../types";

type UserId = string;
type PieceType = string;
type PieceId = string;

export async function runSelection(
  config: RosterLockV1Config,
  seeds: Record<UserId, string>,
  userSelections: Record<UserId, Record<PieceType, Array<PieceId>>>
){
  const users = Object.keys(userSelections);
  await Promise.all(Object.entries(config.engine.pieceDefinitions).map(async ([
    pieceType, pieceConfig
  ])=>{
    await Promise.all(users.map(async (userId)=>{
      const selections = userSelections[userId][pieceType];
      await runLocalValidationScript(
        createPRNG(pieceType, seeds),
        pieceType,
        selections,
        config.selection.piece[pieceType]
      );
    }));
    

  }))
}

function createPRNG(pieceType: PieceType, seeds: Record<UserId, string>){
  const seed = (
    Object.keys(seeds).sort()
    .map(key => seeds[key])
    .join("")
  )
  return function randomFloat(): number {
    return 0;
  }
}

function createLocalPieceMetaGetter(
  config: RosterLockEngineWithRosterAndSelection,
  pieceType: PieceType
){
  const definition = config.engine.pieceDefinitions[pieceType];
  
  return function getPieceMeta(pieceType: string, pieceId: string){
    return config.selection.piece[pieceType].pieceMeta?.pieceMeta[pieceId];
  }
}

type SelectedPiece = {
  id: PieceId,
  selected: "selected" | "required",
  required: Record<PieceType, Array<SelectedPiece>>,
}

async function runLocalValidationScript(
  getRandom: ()=>number,
  getPieceMeta: (pieceType: string, pieceId: string)=>any,
  piecesAvailable: Record<PieceType, Array<PieceId>>,
  userSelection: Array<PieceId>,
  script: string,
){

}


async function runMergeScript(
  getRandom: ()=>number,
  getPieceMeta: (pieceType: string, pieceId: string)=>any,
  piecesAvailable: Record<PieceType, Array<PieceId>>,
  allUserSelections: Record<UserId, Array<PieceId>>,
  script: string,
){

}

async function runGlobalValidationScript(
  getRandom: ()=>number,
  getPieceMeta: (pieceType: string, pieceId: string)=>any,
  piecesAvailable: Record<PieceType, Array<PieceId>>,
  finalSelection: Record<PieceType, Array<PieceId> | Record<UserId, Array<PieceId>>>,
  script: string,
){

}
