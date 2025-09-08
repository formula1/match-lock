# SELECTION RESTRICTION
> specifies the method and restrictions the pieces will be chosen

## pieceRestriction
> Full piece restriction defined in `piece-restriction.md`

## type
> The algorithm used for selection

### type: preset
- set by the selection creator ahead of time
- before "joining" the room, the player can download these options as if they were "selected"

### type: agreed
- the game engine will guide the players to choosing this type
- each player must cryptographically sign the result
- the MatchLock server will validate the signatures
- the MatchLock server will order all players to download the agreed pieces

### type: selected-combine-random-slice
- This is used for situations where both players
- expects an additional `slice` parameter
- algorithm - select-combine-randomize-slice
  - each player chooses their own and sends in a randomization seed
  - the list is combined
  - the list is randomized
    - the seeds are all combined
    - the seeds are used in a psuedo random number generator
    - the list is randomized with the psuedo random number generator
  - the list is sliced

### type: selected
- each player chooses their own count

## count
> Used to set the amount of the piece type the player should choose
- number - when it's just a number, each player is expected to choose that amount, no less no more
- [min: number, max: number] - sets the minimum and maximum amount of the piece type the player should choose

## unique
> Used to set whether the pieces should be unique or not
- true - the pieces should be unique
- false - the pieces can be duplicated

## validators
- name - user readable string
- config
  - schema - json schema to validate the value
  - value - json specifying selection specific values
- script
  - type - the script mimetype (only Typescript/Javascript for now)
  - content - the AssemblyScript to run

### upload serverside
- Make sure the script < 1000 kb (maybe less)
- Validate Typescript
- Typescript -> Javascript
- Javascript -> Wasm - Javy
- make sure it exports a "validate" value that is a function
- save the Wam for later

### run serverside
- get the wasm
- create a wasmtime - @bytecodealliance/wasmtime
- add fuel
- create pointer to validator config
- create a pointer to the array of selected values
- run script
- if result is false, throw "Failed Validation"
