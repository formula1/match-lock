# Match Lock

## Purpose

### Too many Pieces
As the number of possible selectable game pieces, the ability for a player to download all of them ahead of time becomes a problem. By only downloading the pieces they need for a specific match, the amount of data that needs to be downloaded is reduced. It's the belief that Peer to Peer downloading is preferable over http or git but torrent isn't always available. Another important part is to avoid downloading the same piece twice or ignoring pieces if only the visuals are updated.

1. Check if a piece has already been downloaded (patch version changes can be ignored)
2. Download and validate the downloaded files are as expected
3. If patch version changes are available, notify the user
4. Support ways for user's to upload their pieces to popular services
  - git hosting
  - torrent hosting
  - http hosting
  - ftp hosting

### Restriction as a Service
Some characters are absurdely overpowered compared to their counter parts. While fairness in powerlevel is relative to the other characters available, a restriction configuration can be used to make sure matches are more fair. The testing and vetting of characters now becomes a service and can provide players a better experience.

1. Create a restriction configuration
2. Add pieces to the restriction configuration (Minor version change)
  - multiple versions of the same character are allowed
3. Remove pieces from the restriction configuration (Major version change)
4. Update pieces in the restriction configuration
  - If only media files change, update a patch version (no redownload)
  - If one or more logic files change, update the major version (Consider it a new character)
5. Sign the restriction configuration to make sure it hasn't been tampered with


### Selection
Before starting a match, player's need to pick their fighter(s) and stage that might be selected. This selection process needs to be handled somewhat delicately for the following reasons.

#### Player Selection Issues
1. A player who picks before another player opens themselves up to counter picking
2. Some picks will be shared between players and, while players have input, the final selection will be based on algorithm
  - Example: Both players pick a stage, but only one is chosen democratically or at random
3. Some selections have custom validations
  - Example: For tag team a player can have 3 "normal" characters or 1 "boss" character. The characters being a "boss" is configured in a seperate file with the default value being "normal"
4. Some Selections have multiple Steps (This will be ignored for now)
  - Example: Dota has a ban and select stage

#### Network Issues
1. Everyone must agree to the same selection rules ahead of time
2. All selections must be validated before being sent and when recieved
3. Everyone must agree with the final selections made, by players and algorithms
4. One of the player's may be the "host" making all other players provide their selections to the hosting player. The host should not have an unfair advantage.
