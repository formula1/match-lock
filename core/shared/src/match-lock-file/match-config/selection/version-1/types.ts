
import { JSON_Primitive, JSON_Unknown } from "../../../../utils/JSON";
import { MatchLockEngineConfig } from "../../engine";
import { RosterLockPiece } from "../../piece";
import { JSONSchemaType } from "ajv";

type PieceType = string;
type PieceId = string;

export type RosterLockEngineWithRosterAndSelection = {
  engine: MatchLockEngineConfig,
  rosters: Record<PieceType, Array<RosterLockPiece>>,
  selection: {
    pieces: Record<PieceType, (
      | PreselectedPiecesConfig
      | GameControlledSelectionConfig
      | PersonalSelectionConfig
      | SharedSelectionConfig
      | OnDemandSelectionConfig
    )>,
    globalValidation?: GasLimittedScript
  }
}

// Can select pieces as a part of the config
// This is useful if players just want to play a specific stage without the chance of another being chosen
// Final Destination Fox only
// When selecting personal pieces, the array will be applied to all players
type PreselectedPiecesConfig = {
  type: "preselected",
  sharedPieceMeta?: SelectionPieceMeta<any>,
  pieces: Array<PreselectedPiece>
}
type PreselectedPiece = {
  id: PieceId,
  required: Record<PieceType, Array<PreselectedPiece>>,
}

// The game will handle the selection however it wants
// The selection should be sent along side the match lock config when creating a room
// Room will handle the selection as if it were a "preselected" config
type GameControlledSelectionConfig = {
  type: "game-controlled",
  sharedPieceMeta?: SelectionPieceMeta<any>,
}

export type PersonalSelectionConfig = {
  type: "normal",
  /*
  Shared meta exists so there doesn't have to be duplication of metadata between validation and merging
  If a path of the shared meta intersects with validation of merge meta then its invalid
  */
  sharedPieceMeta?: SelectionPieceMeta<any>,

  /*
    The validation is used to validate the current user's and other player's choices
    The validation does not validate the final choices after the merge algorithm is run
  */
  validation?: UserSelectionValidation,

  /*
    A merge algorithm takes in each player's choices and returns a new set of choices
    If the pieceType is "personal", the merge algorithm is expected to return a set of choices per player
    If the pieceType is "shared", the merge algorithm is expected to return a single set of choices
    We validate the return type of the algorithm to ensure it matches the pieceType
  */
  mergeAlgorithm?: ScriptWithPieceMeta<any>
}

export type SharedSelectionConfig = {
  type: "normal",
  sharedPieceMeta?: SelectionPieceMeta<any>,
  validation?: UserSelectionValidation,
  // the mergeAlgorithm is only mandatory for "shared" pieces
  mergeAlgorithm: ScriptWithPieceMeta<any>
}

type OnDemandSelectionConfig = {
  type: "normal",
  /*
    On demand pieces don't have a selection or merge config
    However, they can include pieceMeta
    The pieceMeta can be accessed from the pieces that require it
  */
  sharedPieceMeta?: SelectionPieceMeta<any>,
}



export type SelectionPieceMeta<Config extends JSON_Unknown> = {
  schema: JSONSchemaType<Config>,
  defaultMeta: Config,
  pieceMeta: Record<PieceId, Partial<Config>>,
}

export type UserSelectionValidation = {
  count: number | "*" | [number, number | "*"],
  unique: boolean,
  banList?: Array<PieceId>,
  customValidation: Array<ScriptWithPieceMeta<any>>
}


export type ScriptWithPieceMeta<Meta extends Record<string, JSON_Primitive>> = {
  name: string,
  /*
   The piece meta is passed to the script so it can be used for validation
   An Example is if there is an elemental type associated to each character
   The script can use this to validate that all characters have the same elemental type
  */
  pieceMeta?: SelectionPieceMeta<Meta>,
  script: GasLimittedScript,
}


/*
Global Variables accessible to the script

// This is psuedo random number generator based on seeds from all players during the commit/reveal step
// It returns a float between 0 and 1
RANDOM()

// This is a map of all the piece meta
// Normally only includes the current piece type and any "on demand" piece types that are required by the current piece type
// for globalValidation it includes all piece types after merging
// This is a getter as it will merge default meta with a piece's custom meta
PIECE_META.get(pieceType: string, pieceId: string): Meta

// The pieces available to be selected
// Normally only includes the current piece type and any "on demand" piece types that are required by the current piece type
// for globalValidation it includes all piece types after merging
PIECES_AVAILABLE: {
  [pieceType: string]: Array<PieceId>
}

type SelectedPiece = {
  // The id of the piece
  id: pieceId,
  // Whether the piece was selected or required by the piece config
  selected: "selected" | "required",
  // The "on demand" pieces that are required by this piece
  // Includes both the selected and the pieces defined in the piece's config
  required: Record<pieceType, Array<SelectedPiece>>,
}


// The pieces selected by the current player - only available during individual validation
PLAYER_SELECTION: Array<SelectedPiece>


// The pieces selected by each player - only available during merge algorithms
EACH_PLAYER_SELECTION: {
  [userId: string]: Array<SelectedPiece>
}

// The final merged selection - only available during globalValidation
FINAL_SELECTION: {
  // depending on the pieceType, it's either a list of pieces or a list of pieces per player
  [pieceType: string]: Array<SelectedPiece> | Record<userId, Array<SelectedPiece>>
}

*/
type RelativePath = string;
export type GasLimittedScript = (
  | {
    type: "text/lua",
    content: string,
  }
  // I'm thinking a "published" config will be a tarball of all necessary files
  // This allows users to write scripts in their preferred editor then add them as necessary
  | {
    type?: "text/lua",
    src: RelativePath,
  }
)
