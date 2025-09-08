
# Get Ready
- player wants to join game with restriction
  - they have to download all "mandatory" pieces
- player joins "room"
  - This is up in the air on how rooms will work
- Locally, in game, players make choices based on the selection
  - 🟡 Ping Pong during selection, if a player fails to respond, throw error
  - 🔴 If a player fails to make a choice within a time limit, throw error
- When Everyone has ready, can move to Selection

# Selection
- Game Sends
  - Restriction Config
  - Selection made Ingame
  - The current user's userId
  - Room - A way to communicate with the other users (listening and broadcasting)
- ▶️ All players agree on a restriction
  - 🔴 If a player agrees to the wrong restriction, throw error
  - 🔴 If a player joins with the wrong restriction, throw error
- When ready in game
  - players encrypt their choices and random seeds
  - ▶️ send the encrypted data to everyone else
- 🔴 If a player takes too long to send their encrypted data, throw error
- ⬅️⌛ Wait for everyone to send their encrypted data
  - ▶️ players send their descryption keys
  - 🔴 If a player takes too long to send their decryption key, throw error
  - ⬅️⌛ When a recieving a players decryption key
    - they decrypt the player's data
      - 🔴 If the decryption fails, throw error
    - for each collection type
      - If the selection config involves personal choice
        - validate each piece exists
        - validate the choice count
        - validate the choice unqiueness
        - validate the choice against custom validation (if applicable)
          - 🔴 If validator runs out of fuel, throw error
        - 🔴 If the validation fails, throw error
        - 💾 If valdiation succeeds and there's no algorithm, save the player's collection choice
  - ⬅️⌛ Wait for all players to send their decryption keys
    - for each collection type
      - If the selection config involves an algorithm
        - create a psuedo random number generator using all the random seeds
        - run algorithm (if applicable)
          - pass in all possible pieceIds Array<string>
          - If applicable - pass in player selected pieceIds { [playerId: string]: Array<string> }
        - 🔴 If algorithm runs out of fuel, throw error
        - 🔴 If algorithm fails, throw error
        - 🔴 If algorithm doesn't return the expected type of result, throw error
        - 🔴 If the pieces the algorithm chose don't exist, throw error
        - 💾 If algorithm succeeds, save the algorithm's collection choice
- ⌛ When all collection choices have been finished
  - ▶️ Sign the collection choices and send to everyone else
  - 🔴 If anyone disagrees with the final selections, throw error and exit


# Download
- Game Sends
  - Final Selections
  - The current user's userId
  - Room - A way to communicate with the other users (listening and broadcasting)
- ⬅️⌛ When all players have agreed to the final selections
  - 🟡 Ping Pong during downloads, if a player fails to respond, throw error
  - ▶️ Send Personal Progress to other players
  - For Each piece type, for each piece - try to ensure
    - Check if the piece exists locally - Yes, no problem
    - Try to download the piece using a MatchLockResolvable
      - 🔴 If it fails, try the next resolvable
      - Validate each file in the piece tracked by the assets property
        - 🔴 If the validation fails, delete folder, try next resolvable
      - 🔴 If all fail, throw error and exit
- ▶️ Notify everyone your downloads are complete
- ⬅️⌛ Wait for everyone's downloads to complete
- ▶️ Send Goodbye to everyone else
- ⬅️⌛ Wait for everyone's Goodbye
- Provide the game the selection and the folder path to each seleection


