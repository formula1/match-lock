# PIECE RESTRICTION
> restricts what pieces **can be** used in a game's match

## 

## restrictionVersion
> specifies how the restriction will handle pieces and assets

## valueTypes: piece
- when `valueTypes === "piece"` there are piece types but no restriction in the engine config

## engine
- name - specifies the name of the engine that will be used
- version - semver specifying the maximum major version and minimum version minor version

### valueTypes: piece
- pieceDefinition - each piece definition is a config with
  - piece restriction name
- each piece collection must have a valid piece restriction
- multiple pieces can chare the same asset restriction

## pieces\[pieceCollectionId\]
- type
  - "mandatory" - Must be downloaded ahead of time
  - "selectable" - Can be selected through the selection config
  - "on-demand" - Can't be selected but can be downloaded as a "requiredPiece"
- pieceDefinition - the pieceDefintion name saved in the engine
- pieces: MatchLockGamePiece[]

### pieces\[pieceCollectionId\].pieces[]
- id - a way to identify the piece without name
- name - name of the piece for user purposes
- authorId - a way to identify authors with the same name
- authorName - name of the author

- version - SemVer
- sha256 - hash to make sure the downloaded file is the same as the one uploaded
- sizeBytes - size to make sure the downloaded file is the same as the one uploaded
- sources - ways to download the file

- requiredPieces - the pieces that are required for this piece
  - will trigger a download if not already in queue
  - should be the only way to trigger the download of a piece that is in an "on-demand" collection

