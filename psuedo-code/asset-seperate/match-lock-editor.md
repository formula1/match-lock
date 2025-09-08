# Match Lock Config

## Match Lock File
- Create Signiture and save to file
- Use Signiture from file
- Load Config
  - if the config is not the current signiture let the user know
- Save Config
  - signiture isn't needed yet
- Publish Config
  - sign the config, update the file, save it
- Upload Config to Server
  - Config must be signed
  - Need to provide all pieces
  - Server will ask for any pieces the server isn't offering yet


## Match Lock Game Specific Config
- Specify Game Engine
- Add/Remove Mandatory Peices
  - This is needed for Warcraft 3 style map sharing
  - Updates Major Semver
- Add/Remove Piece Collection
  - choose a pieceType
  -  we need to include a choosing algorithm
    - Mandatory
      - this must be downloaded
      - example: for warcraft 3 style maps, shared models and triggers are downloaded
    - Selectable
      - this is only downloaded if actively selected
    - On Demand
      - this is only downloaded if required by another piece
- Add Pieces to Piece Collection
  - Updates Minor Semver
- Remove Pieces to Piece Collection
  - Updates Major Semver
