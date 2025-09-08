# Server
## Resolve Peice Download
- Get peice magnet uri

## Room creation process (has privlidged access to create rooms)
- External Methods
  - Ranked Matchmaking - creates a room with the users matched up
  - Create/Join/Start room - creates a room with all the joined users
- From External Method
  - recieves the match-lock config
  - For each player, recieves a public encryption key 
- creates room id
  - send room id back to the external method
- For each player
  - creates a unique key
  - encrypts the key
  - sends encrypted key back to the external method
- saves
  - room id
  - player keys
  - match lock config

## Game Preparation
- if player tries to join with improper Id
  - disconnect
- if player tries to join with an id that is already connected
  - throw error for all users
  - destroy room
- for each player in room
  - player join the room
  - validate player
  - player sends required chosen parts to server
    - validate chosen parts
    - relay those parts to other players in room
  - player recieve's chosen parts from players already in room
  - wait for player to let server know all parts are downloaded
- when all players have downloaded all parts
  - notify all players that the room is finished
  - destroy room
- If one player takes too long
  - throw error for all users
  - destroy room
- If one player provides incorrect information
  - throw error for all users
  - destroy room
