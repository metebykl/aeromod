import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  disableAddon,
  enableAddon,
  getAddon,
  getAddons,
  installAddon,
  uninstallAddon,
  type VerificationResult,
  verifyAddon,
} from "@/api/addon";

export const useGetAddon = (id: string) => {
  return useQuery({ queryKey: ["getAddon", id], queryFn: () => getAddon(id) });
};

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

export const useVerifyAddon = (
  options?: MutateOptions<VerificationResult, Error, string, unknown>
) => {
  return useMutation({ mutationFn: verifyAddon, ...options });
};
