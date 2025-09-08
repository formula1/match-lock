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
- Add/Remove Piece Type
  -  we need to include a choosing algorithm
    - Mandatory
      - this must be downloaded
      - example: for warcraft 3 style maps, shared models and triggers are downloaded
    - Personal
      - each user selects their own piece
      - example: user picks a fighting character
    - Shared
      - each user may attempt to select a piece or choose not to choose
      - from the list of selected peices, one is chosen at random
      - if no one chooses, that one is chosen at random from the available
      - example: different users choose a fighting stage, but they both must fight on the same one
- Add Pieces to Piece Type
  - Updates Minor Semver
- Remove Pieces to Piece Type
  - Updates Major Semver
- Update Piece Logic
  - Updates Major Semver
- Update Piece Media (Instead of visual since sounds may also can get updated)
  - Updates Patch Semver
