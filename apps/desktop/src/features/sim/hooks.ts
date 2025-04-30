import { type MutateOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { clearRollingCache, clearSceneryIndexes } from "./api";

export const useClearRollingCache = (
  options?: MutateOptions<void, Error, void, unknown>
) => {
  return useMutation({
    mutationFn: clearRollingCache,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useClearSceneryIndexes = (
  options?: MutateOptions<void, Error, void, unknown>
) => {
  return useMutation({
    mutationFn: clearSceneryIndexes,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};
