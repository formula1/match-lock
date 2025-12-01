import { Readable } from "node:stream"
import { MatchLockResolvable } from "@match-lock/shared";

export type ResolvableStream<T extends MatchLockResolvable> = (
  (config: T)=>Promise<{
    filename: string,
    stream: Readable,
  }>
);
