# TODO

Part of match-lock is matchmaking users together.

# Plan
- User creates a room
  - Post Body
    - Advertisement Title
    - Matchlock Config
    - Public User Encryption Key
  - Validates the Matchlock Config
  - Stores
    - Room Id
    - Title
    - Matchlock Config
  - Returns the room id
- Creator can cancel a room
- User Lists all Available Room
  - Filter By Engine
  - For Each Room
    - View how many pieces are already locally downloaded
- User joins a room
  - Post Body
    - Room Id
    - Public User Encryption Key
  - Check If User Limit has been Reached
    - If so, return error
  - Check If User has already joined
    - If so, return error
  - Add User to Room
  - Check If User is Last to Join
    - If so, create relay room
    - pass relay room info, encrypted user keys and relay url to each user
    - delete room from database
