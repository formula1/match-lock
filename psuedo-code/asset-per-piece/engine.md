# Engine Requirements

## Defintions
- Raw Piece - this is the folder that houeses the files the engine will user
- Restriction Config - this is a file that lets the user's know
  - what pieces are allowed to be used
  - Methods for downloading a piece
  - File descriptions for ensuring the downloaded piece is the correct one
- MatchLock Collection Id - this is a unique identifier for a collection of pieces
- MatchLock Piece Id - this is a unique identifier for a piece

## Required Actions
The engine must be able to
- test characters from a local or downloaded raw piece folder
- create matchlock piece configs from a raw piece folder
- when choosing pieces, must map a piece to a matchlock pieceId
  - this pieceId will be sent to the matchlock room for others to download
- map a matchlock Collection Id and Piece Id to internally installed piece's folder
  - Example Ikemen-Go: recieves a piece config for a `character`
    - go to the `chars` folder
    - go through each character to see if it matches the config
    - if found - return the folder to the matchlock room
    - else - return a missing error to the matchlock room
- handle a matchlock finish config
  - when matchlock is done, it will send the engine a list of CollectionId/PieceId mapped to a folder
  - its then up to the user to find out how to use it

