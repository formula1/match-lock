Important to note: when I say "game piece" I mean interchangable game parts, usually selectable by the user. For example fighting game characters and Stages are pieces. Hypothetically, game mode like Tag Team or 1v1 are also pieces.

So theres 3 major parts to this

# Preparation Application
> Before MatchLock can be used by a game, we need a few things. A way to identify an engine, hopefully the engine is using semver so that two players can use similar engine versions. A way to validate pieces, this is so that all pieces on a restriction config or scanned will be considered valid for the engine. A way to scan a folder to identify pieces, at the moment engines using MatchLock will have their own way of saving pieces we can scan each folder and use the pieces in it. Create a Selection config. Adding pieces to a restriction config.

## Purposes
- Engine Validation - While each engine may be similar in purpose, they may expect their piece's file structure to be different. For example a 2d fighting game and 2.5d fighting game may have similar hit box data but the 2.5d will have 3d models and animations while the 2d will have a bunch of sprites. We need to create an engine piece validator so that locally scanned and pieces in a restriction can have an expected and valid file structure.
- Scan Folder - Before starting with matchlock a player may already have a folder full of game pieces. It would be a burden to make the player go through each game piece and change their folder names. Instead Match Lock should be able to scan each folder, ensure it's file structure passes the engine's expected piece file structure and create a unique Identifier based on the file hashs
- Selection Configuration - While a game can be as simple as 1v1, some games could be 3v3. Some games expect each piece to be unique. For stage selection, it should be democracy or random which stage wins. These selection configurations should be easy to read and be simple to code if they are special.
- Piece Restriction Config - An important part of the MatchLock Restriction config is the available pieces. Each piece is expected to have ways to download them. Some preview info like a title, image and url to view more information. Version hash based on the files so it can be calculated. File descriptions including the filepath, file sizes and hashes. The name and author for building humane folder structures. Each restriction config will have a semver based on it's pieces. Adding Pieces should increment a minor version. Removing pieces should increment major versions. Updating pieces is considered a removal and an addition.



# Server (or smart contract)
> Matchlock is meant for online games. Local games can be handled by the game itself but online games enter into the unknown. The 20 characters I have available may not be the same as another player's 20 characters but both are considered legal by the restriction. However, I'm pretty sure that most of what a server can do can also be done by a smart contract, it may be slower but at least it's decentralized. Making it easy to spin up a server is important to me. It would probably be a good idea to create a Docker file.

## Purpose
- Browsing Restrictions
  - Part of the beauty of this is people who like to test characters can create rosters based on what they like and within a similar balance
  - People may want to find restrictions that have characters they've already downloaded (should be done by engine and hash)
  - User's should be able to deprecate one of their previous restrictions
- facilitate match making
  - room making using a restriction, browsing and joining
  - restriction based auto matchmaking (This may require the server also watching the game to determine a player leaves, winner and loser)
- relay messages from one user to another
  - The server doesn't need to read the messages normally
  - wait till everyone is ready
  - relay messages
  - relay failure and close room
  - on success go to next step
- facilitate downloads - the download source can be different than the matchmaking server
  - Act as a torrent Tracker
  - direct HTTP downloads available




# User Library
> Matchlock on it's own isn't a game but to help games match make, validate selections and handle downloads. That means it needs to be written in the language of the game that is using it or be available as a cli tool or local server api that can be called from the actual game.

## Purposes
- view what characters they have that fit in a restriction
  - some restrictions may include all the characters a player has, some restrictions may only allow 3. Its important to know your legal selection before joining.
  - while a player may have their roster they've chosen specifically for their engine, it's also nice to know what characters they've downloaded that are available to be used. While a character may not be in their top 20, when you only have 5 favorited characters, seeing whos on the bench would be nice
  - Tracking a user's selection may also give hints on their prefferred bench warmers are
  - The library user should be able to ask for X bench warmers that match a MatchLock Restriction
- connect to a match
  - some match making will be automatic, others may be browseable
  - there may be "mandatory" pieces that must be downloaded before joining the match
- Handle Selection
  - share local selection
  - validate and handle foreign selection
  - run selection algorithms when necessary
- Download pieces
  - check local folders to see if the pieces are already downloaded
    - this includes "scanned folders" as well as folders under MatchLock's control
  - if a piece hasn't been downloaded, download it in the designated folder
  - Relay download progress to other players
- Tell the Parent Application the selected pieces and the piece's download locations

