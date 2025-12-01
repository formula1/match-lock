
import { runValidator } from "./validation";
import { runAlgorithmGlobal, runAlgorithmPlayer } from "./algorithm";

export const runners = {
  "validation": runValidator,
  "global-choices": runAlgorithmGlobal,
  "player-choices": runAlgorithmPlayer,
};
