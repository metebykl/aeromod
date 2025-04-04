import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  disableAddon,
  enableAddon,
  getAddons,
  installAddon,
  uninstallAddon,
} from "@/api/addon";

export const useGetAddons = () => {
  return useQuery({ queryKey: ["getAddons"], queryFn: getAddons });
};

export const useInstallAddon = (options?: MutateOptions<boolean>) => {
  return useMutation<boolean>({ mutationFn: installAddon, ...options });
};

export const useEnableAddon = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({ mutationFn: enableAddon, ...options });
};

export const useDisableAddon = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({ mutationFn: disableAddon, ...options });
};

export const useUninstallAddon = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({ mutationFn: uninstallAddon, ...options });
};
