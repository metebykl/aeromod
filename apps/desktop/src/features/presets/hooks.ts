import {
  type MutateOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  applyPreset,
  createPreset,
  getPreset,
  listPresets,
  removePreset,
  updatePreset,
} from "./api";
import type { Preset } from "./types";

export const presetKeys = {
  all: ["presets"],
  preset: (id: string) => ["preset", id],
};

export const useListPresets = () => {
  return useQuery({
    queryKey: presetKeys.all,
    queryFn: () => listPresets(),
  });
};

export const useGetPreset = (id: string) => {
  return useQuery({
    queryKey: presetKeys.preset(id),
    queryFn: () => getPreset(id),
  });
};

export const useCreatePreset = (
  options?: MutateOptions<void, Error, Preset, unknown>
) => {
  return useMutation({
    mutationFn: createPreset,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useApplyPreset = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({
    mutationFn: applyPreset,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useUpdatePreset = (
  options?: MutateOptions<void, Error, Preset, unknown>
) => {
  return useMutation({
    mutationFn: updatePreset,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};

export const useRemovePreset = (
  options?: MutateOptions<void, Error, string, unknown>
) => {
  return useMutation({
    mutationFn: removePreset,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};
