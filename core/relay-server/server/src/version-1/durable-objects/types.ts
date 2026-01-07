import { DurableObjectState } from "@cloudflare/workers-types";

export type RoomType = {
  state: DurableObjectState;
  broadcast: (message: { userId: string; type: string; payload: any }) => void;
  completeRoom: () => void;
};

export interface RelayMessage {
  type: string;
  payload: unknown;
}

