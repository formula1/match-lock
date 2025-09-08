# PIECE RESTRICTION
> restricts what pieces **can be** used in a game's match

## 

## restrictionVersion
> specifies how the restriction will handle pieces and assets

## valueTypes: asset
- when `valueTypes === "asset"` there are piece/asset restrictions in the engine config
- each piece corresponds with a list of assets
- there's an additiona

## engine
- name - specifies the name of the engine that will be used
- version - semver specifying the maximum major version and minimum version minor version

### valueTypes: asset
- pieceDefinitions - each piece restriction is a config with
  - piece restriction name
  - list of asset filetypes
  - counts restrictions
- assetDefinitions - each asset restirction is a config with
  - the asset restriction name
  - whether the asset is "logic" or "media"
    - changing media updates the minor version
    - changing logic updates the major version
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
- assets - the assets that are required for this piece
  - type: "full" - the piece is a full asset
  - type: "pieces" - the piece is a collection of assets
- requiredPieces - the pieces that are required for this piece
  - will trigger a download if not already in queue
  - should be the only way to trigger the download of a piece that is in an "on-demand" collection



## assets\[assetId\]
- id - a way to identify the asset without name
- name - name of the asset for user purposes
- authorId - a way to identify authors with the same name
- authorName - name of the author

- assetType
  - the restriction name from `engine.assetDefinitions`
  - updating this will change the semver depending on the classification
- version - SemVer
- sha256 - hash to make sure the downloaded file is the same as the one uploaded
- sizeBytes - size to make sure the downloaded file is the same as the one uploaded
- sources - ways to download the file
