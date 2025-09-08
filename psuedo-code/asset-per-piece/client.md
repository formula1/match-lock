# Client
## Download Full Match-Lock
> To avoid download problems, the client can download all peices ahead of time
- Client provides a config file
- for all peice collections in the config, download each piece

## Download Mandatory Peices
> Before the user joins a MatchLock room, they are expected to download all mandatory peices
- Client provides a config file
- for all mandatory peice collections in the config, download each piece

## Room Resolution
### Room Abstraction
> Rooms might not just be an http/websocket server.
> For example, Ikemen Go allows a user to directly connect to another user's IP address and Port over TCP
> Another example is users connecting locally over LAN
- Making Room
- Creating Connection to Room
- Handling Message from Room
- Sending Message to Room
- Closing Connection to Room

### Creating Room
> Room creation process is handled seperately.
> Room can be created on a user's machine, directly on a server or through a third party service
- Requirements to Create Room
  - config with
    - roomId - unique
    - piece restriction config
    - all the pieces expected to download (It doesn't matter who chose what)
      - Map<pieceCollectionId, pieceId[]>
    - users expected to join
      - Map<userId, { publicSignitureKey: string }>
    - the signitures of the above config for each user
      - Map<userId, signiture>

### Joining Room
- Create Room connection
- User tells the server that they are joining the room with roomId
- User validates who they are
- User recieves the current progress of all other users
  - whether they have connected
  - the progress of each piece
    - status of the piece - not started, in progress, is finished, download error
    - progress of the piece
- User tells the server the current progress of each piece
  - for each piece
    - check if already downloaded
      - must check engine's filesystem
      - checks locally
    - if downloaded
      - tell room it's finished
      - exit
    - for each resolvable on piece
      - try to download with it
      - if success - send progress to the room
      - if fail - try next
    - if all resolvables fail - tell room it had an error
    - if download success - tell room
- When recieve message from room
  - if message is progress, update user\[pieceId\].progress
  - if message is error, update user\[pieceId\].error
  - if message is finished, update user\[pieceId\].finished
    - check if room is finished

### Finished Downloads
- if a user has finished a piece - check if they are completely finished
  - if not - exit
  - if yes - check if all other users have finished
  - if not - exit
- each user sends a "goodbye" message to everyone else
- close room connection
- respond the the "Match Lock" consumer
  - Map<pieceId, folder>
