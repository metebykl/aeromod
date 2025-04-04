import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { getAddons, installAddon } from "@/api/addon";

export const useGetAddons = () => {
  return useQuery({ queryKey: ["getAddons"], queryFn: getAddons });
};

export const useInstallAddon = (options?: MutateOptions<boolean>) => {
  return useMutation<boolean>({ mutationFn: installAddon, ...options });
};
