

# Match Lock Prepare

## Ensure Restriction
- user can creates a new restriction
- user can load a different restriction

## Update Restriction
- user adds a piece to the restriction
  - user must download the piece first
- user removes piece from the restriction

## Testing Restriction
- User creates a 

## Finalize Restriction
- user uploads all the pieces to a resolvable location
  - chooses one or more upload method and supplies the necessary information
    - the upload method is a custom function that handles a File
    - the upload method should return a valid `MatchLockResolvable`
      - http - should return a public url to retrieve it from
      - torrent
      - git
  - for each upload method, store the `MatchLockResolvable` on the piece
- user cryptographically signs the restriction
- user adds the signiture to the restriction
- user uploads the restriction along with the public key to a location to be retrieved
