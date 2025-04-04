import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { type AppSettings, getSettings, updateSetting } from "@/api/settings";

export const useGetSettings = () => {
  return useQuery({ queryKey: ["getSettings"], queryFn: getSettings });
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
    ...options,
  });
};
