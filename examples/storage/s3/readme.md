# TODO

Part of match-lock is downloading the necessary pieces missing locally.

# Plan
- User uploads a piece
  - Post Body
    - Engine Config
    - Piece Type
      - Path Variables expected by the piece type
    - Human Readable Information
    - Tar Ball of the piece
  - validates the piece
    - Engine Config Filesystem tests
    - Engine Docker Tests
  - Stores the piece
    - Create indexes For
      - Date Uploaded
      - Author
      - Human Readable Title
      - Engine Config
      - Piece Type
      - Logic Hash
      - Media Hash
    - Uploads Tar Ball to s3
- Users can download a piece directly
  - engine/piece-type/logic-hash/media-hash.tar
