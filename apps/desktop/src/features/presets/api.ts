import { ipc } from "@/lib/ipc";
import type { Preset } from "./types";

export const createPreset = (preset: Preset): Promise<void> => {
  return ipc("create_preset", { preset });
};

export const listPresets = (): Promise<Preset[]> => {
  return ipc("list_presets");
};

export const getPreset = (id: string): Promise<Preset[]> => {
  return ipc("get_preset", { id });
};

export const applyPreset = (id: string): Promise<void> => {
  return ipc("apply_preset", { id });
};

export const updatePreset = (preset: Preset): Promise<void> => {
  return ipc("update_preset", { preset });
};

export const removePreset = (id: string): Promise<void> => {
  return ipc("remove_preset", { id });
};
