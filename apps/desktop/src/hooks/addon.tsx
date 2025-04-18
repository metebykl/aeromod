import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disableAddon,
  enableAddon,
  getAddon,
  getAddons,
  installAddon,
  renameAddon,
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

export const useInstallAddon = (
  options?: MutateOptions<boolean, Error, void, unknown>
) => {
  return useMutation({
    mutationFn: installAddon,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useEnableAddon = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({
    mutationFn: enableAddon,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useDisableAddon = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({
    mutationFn: disableAddon,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useUninstallAddon = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({
    mutationFn: uninstallAddon,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useRenameAddon = (
  options?: MutateOptions<void, Error, { id: string; newId: string }, unknown>
) => {
  return useMutation({
    mutationFn: ({ id, newId }) => renameAddon(id, newId),
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useVerifyAddon = (
  options?: MutateOptions<VerificationResult, Error, string, unknown>
) => {
  return useMutation({
    mutationFn: verifyAddon,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};
