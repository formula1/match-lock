import { JSON_Unknown, MatchLockRestrictionConfig } from "@match-lock/shared";
import { MATCHLOCK_SELECTION_STATE, UserMessegeError } from "./constants";
import {
  encryptJSON, decryptJSON,
  CastEncryptedMessage,
} from "./steps/encrypton";
import {
  PlayerSelection, validatePlayerSelection, createRandomSeed,
  PlayerSelectionWithSeed
} from "./steps/player-selection";
import {
  finalizeSelection,
  FinalSelection,
  CastFinalSelection
} from "./steps/final-selection";
import { Room } from "../types/room";
import { deepEqual } from "node:assert";

const STATE_ORDER = [
  MATCHLOCK_SELECTION_STATE.hello,
  MATCHLOCK_SELECTION_STATE.restriction,
  MATCHLOCK_SELECTION_STATE.selectionEncrypt,
  MATCHLOCK_SELECTION_STATE.selectionDecrypt,
  MATCHLOCK_SELECTION_STATE.selectionFinal,
  MATCHLOCK_SELECTION_STATE.goodbye,
];

export async function handleRoomSelections(
  room: Room,
  restriction: MatchLockRestrictionConfig,
  selection: PlayerSelection,
){
  let state = MATCHLOCK_SELECTION_STATE.hello;
  const recievedMessages = new Map<MATCHLOCK_SELECTION_STATE, Set<string>>();


  // Prepare shared messages
  const encryptedData = new Map<string, { iv: string, ciphertext: string }>();
  const userSelections = new Map<string, PlayerSelectionWithSeed>();
  let initialSelection: FinalSelection | null = null;
  const finalSelections = new Set<string>();


  // Prepare own Selections
  const rngSeed = createRandomSeed();
  const ownEncrypted = await encryptJSON({
    selection, rngSeed
  });


  const { promise, resolve, reject } = Promise.withResolvers();
  try {
    validatePlayerSelection(restriction, { selection, rngSeed });
  }catch(e){
    reject(e);
    return promise;
  }

  // Send our "hello" after we start listening
  Promise.resolve().then(async ()=>{
    room.broadcast(MATCHLOCK_SELECTION_STATE.hello, "hello");
  });
  room.listen(async (userId, event, data)=>{
    try {
    switch(event){
    case MATCHLOCK_SELECTION_STATE.hello: {
      const saidHelloSize = validateMessageState(userId, event);
      if(saidHelloSize < room.numberOfUsers) return;

      // If we've seen all the hellos, go to restriction state
      updateState();
      room.broadcast(MATCHLOCK_SELECTION_STATE.restriction, restriction)
      return;
    }
    case MATCHLOCK_SELECTION_STATE.restriction: {
      const sameRestrictionsSize = validateMessageState(userId, event);
      deepEqual(data, restriction, "Restriction Mismatch")
      if(sameRestrictionsSize < room.numberOfUsers) return;

      // If we've seen all the restrictions, go to selection encryption state
      updateState();
      room.broadcast(MATCHLOCK_SELECTION_STATE.selectionEncrypt, ownEncrypted.encrypted)
      return;
    }
    case MATCHLOCK_SELECTION_STATE.selectionEncrypt: {
      const encryptedDataSize = validateMessageState(userId, event);

      const casted = CastEncryptedMessage.check(data);
      encryptedData.set(userId, casted);

      // We aren't storing our own encrypted data
      if(encryptedDataSize < room.numberOfUsers) return;

      // If we've seen all the encrypted data, go to selection decryption state
      updateState();
      room.broadcast(MATCHLOCK_SELECTION_STATE.selectionDecrypt, ownEncrypted.key)
      return;
    }
    case MATCHLOCK_SELECTION_STATE.selectionDecrypt: {
      const sentDecryptionKeySize = validateMessageState(userId, event);

      if(typeof data !== "string") throw new Error("Invalid Decryption Key");
      const encrypted = encryptedData.get(userId);
      if(!encrypted) throw new Error("Missing Encrypted Data");
      const decrypted = await decryptJSON(data, encrypted);
      const casted = await validatePlayerSelection(restriction, decrypted);
      userSelections.set(userId, casted);

      if(sentDecryptionKeySize < room.numberOfUsers) return;
      const ownFinalSelection = await finalizeSelection(
        restriction, Object.fromEntries(userSelections)
      );

      updateState()
      room.broadcast(MATCHLOCK_SELECTION_STATE.selectionFinal, ownFinalSelection)
      return;
    }
    case MATCHLOCK_SELECTION_STATE.selectionFinal: {
      const finalSelectionsSize = validateMessageState(userId, event);

      const casted: FinalSelection = CastFinalSelection.check(data);
      if(initialSelection === null){
        initialSelection = casted;
      } else {
        deepEqual(initialSelection, casted, "Final Selection Mismatch");
      }

      if(finalSelectionsSize < room.numberOfUsers) return;

      // If we've seen all the final selections, go to download state
      updateState();
      room.broadcast(MATCHLOCK_SELECTION_STATE.goodbye, "goodbye");
      return;
    }

    case MATCHLOCK_SELECTION_STATE.goodbye: {
      const saidGoodbyeSize = validateMessageState(userId, event);

      if(saidGoodbyeSize < room.numberOfUsers) return;
      resolve(initialSelection);
      return;
    }
    }
    }catch(e){
      reject(e);
    }
  });

  return promise;

  function validateMessageState(
    userId: string,
    messageState: MATCHLOCK_SELECTION_STATE
  ){
    if(state !== messageState){
      const currentIndex = STATE_ORDER.indexOf(state);
      const messageIndex = STATE_ORDER.indexOf(messageState);
      if(messageIndex === currentIndex + 1){
        console.warn(`User Sent ${messageState} Early`, userId);
        console.warn("We'll still process it as other messages may just be late");
      } else {
        throw new UserMessegeError(userId, `Expected ${state} message`);
      }
    }
    if(!recievedMessages.has(messageState)){
      recievedMessages.set(messageState, new Set());
    }
    if(recievedMessages.get(messageState)!.has(userId)){
      throw new UserMessegeError(userId, "User Sent Message Twice");
    }
    recievedMessages.get(messageState)!.add(userId);
    return recievedMessages.get(messageState)!.size;
  }

  function updateState(){
    const currentIndex = STATE_ORDER.indexOf(state);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= STATE_ORDER.length) {
      throw new Error("No next phase after " + state);
    }
    state = STATE_ORDER[nextIndex];
  }
}

