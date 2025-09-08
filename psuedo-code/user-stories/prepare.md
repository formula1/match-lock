# Match Lock Preperation
- Scans a folder for all "pieces" without a `match-lock.publish.json` or `match-lock.scan.json`
  - Creates a `match-lock.scan.json` for each piece
- Define a folder where all future downloaded pieces will be stored
  - They can be the same folder
  - Each piece is likely going to be stored in `{folder}/{author}/{pieceName}`