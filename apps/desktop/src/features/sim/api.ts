import { ipc } from "@/lib/ipc";

export const clearRollingCache = (): Promise<void> => {
  return ipc("clear_rolling_cache");
};

export const clearSceneryIndexes = (): Promise<void> => {
  return ipc("clear_scenery_indexes");
};
