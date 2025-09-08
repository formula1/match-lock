
import { Room } from "../types/room";
import { ExternalUserError, MATCHLOCK_SELECTION_STATE } from "./constants";

export async function errorWrapper(
  room: Room,
  runningProcess: Promise<any>
){
  let currentCancelables: Array<()=>void> = [];
  try {
    return await Promise.race([
      new Promise((resolve, reject)=>{
        const off = room.listen(((userId, event, message)=>{
          if(event === MATCHLOCK_SELECTION_STATE.failure){
            reject(new ExternalUserError(userId, message));
          }
        }));
        currentCancelables.push(off);
      }),
      new Promise(function(resolve, reject){
        const to = setTimeout(reject, 10_000);
        currentCancelables.push(()=>(clearTimeout(to)));
      }),
      runningProcess
    ])
  }catch(e: any){
    console.log("Match To Start Failed", e);
    if(!(e instanceof ExternalUserError)){
      room.broadcast(MATCHLOCK_SELECTION_STATE.failure, e.message);
    }
    room.disconnect();
    for(const cancelable of currentCancelables){
      cancelable();
    }
    throw e;
  }
}
