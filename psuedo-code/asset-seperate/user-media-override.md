
# Personal Modification

## User Wants to Use custom Media - Psuedocode
- user downloads high definition models/textures
- user uses "Personal Modification Client"
  - user finds piece author/name/semver that the media is for
  - user tells client to update personal config to use the high definition folder for that piece
  - client saves the personal configuration
- when a game uses Match Lock to load that piece's media
  - before using the match lock config
    - it sees the personal configuration
    - it sees the pieces author/name/semver
    - uses the custom media
