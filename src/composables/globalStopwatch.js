// src/composables/globalStopwatch.js
import { useStopwatch } from "vue-timer-hook";

const autoStart = true;
const stopwatch = useStopwatch(autoStart); // no offset needed — starts at 0:0:0:0

export function useGlobalStopwatch() {
  return stopwatch;
}
