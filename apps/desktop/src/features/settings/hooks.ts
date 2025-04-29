import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getSettings, updateSetting } from "./api";
import type { AppSettings } from "./types";

export const settingsKeys = {
  all: ["settings"],
};

export const useGetSettings = () => {
  return useQuery({ queryKey: settingsKeys.all, queryFn: getSettings });
};

export const useUpdateSetting = <T extends keyof AppSettings>(
  options?: MutateOptions<
    void,
    Error,
    { key: T; value: AppSettings[T] },
    unknown
  >
) => {
  return useMutation({
    mutationFn: ({ key, value }) => updateSetting(key, value),
    onError: (e) => toast.error(e.message),
    ...options,
  });
};
