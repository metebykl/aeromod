import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getSceneryCache, rebuildSceneryCache } from "./api";
import type { SceneryCache } from "./types";

export const sceneryCacheKeys = {
  all: ["sceneryCache"],
};

export const useGetSceneryCache = () => {
  return useQuery({
    queryKey: sceneryCacheKeys.all,
    queryFn: () => getSceneryCache(),
  });
};

export const useRebuildSceneryCache = (
  options?: MutateOptions<SceneryCache, Error, void, unknown>
) => {
  return useMutation({
    mutationFn: rebuildSceneryCache,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};
