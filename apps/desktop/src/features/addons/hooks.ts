import {
  type MutateOptions,
  queryOptions,
  type QueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { QueryConfig } from "@/lib/react-query";
import {
  disableAddon,
  enableAddon,
  getAddon,
  getAddons,
  getAddonThumbnail,
  installAddon,
  renameAddon,
  uninstallAddon,
  verifyAddon,
} from "./api";
import type { InstallResult, VerificationResult } from "./types";

export const addonsKeys = {
  all: ["addons"],
  addon: (id: string) => ["addon", id],
  thumbnail: (id: string) => [...addonsKeys.addon(id), "thumbnail"],
};

export const useGetAddon = (id: string) => {
  return useQuery({
    queryKey: addonsKeys.addon(id),
    queryFn: () => getAddon(id),
  });
};

export const useGetAddonThumbnail = (
  id: string,
  options?: QueryOptions<string>
) => {
  return useQuery({
    queryKey: addonsKeys.thumbnail(id),
    queryFn: () => getAddonThumbnail(id),
    ...options,
  });
};

export const getAddonsOptions = () => {
  return queryOptions({
    queryKey: addonsKeys.all,
    queryFn: getAddons,
  });
};

export const useGetAddons = (
  options?: QueryConfig<typeof getAddonsOptions>
) => {
  return useQuery({ ...getAddonsOptions(), ...options });
};

export const useInstallAddon = (
  options?: MutateOptions<InstallResult, Error, void, unknown>
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
