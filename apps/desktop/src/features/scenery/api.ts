import { ipc } from "@/lib/ipc";
import type { SceneryCache } from "./types";

export const getSceneryCache = (): Promise<SceneryCache> => {
  return ipc("get_scenery_cache");
};

export const rebuildSceneryCache = (): Promise<SceneryCache> => {
  return ipc("rebuild_scenery_cache");
};
