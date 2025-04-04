import { invoke } from "@tauri-apps/api/core";

export interface Addon {
  id: string;
  name: string;
  creator: string;
  version: string;
  content_type: string;
  enabled: boolean;
  size: number;
}

export const getAddons = (): Promise<Addon[]> => {
  return invoke("get_addons");
};

export const installAddon = (): Promise<boolean> => {
  return invoke("install_addon");
};

export const enableAddon = (id: string): Promise<void> => {
  return invoke("enable_addon", { id });
};

export const disableAddon = (id: string): Promise<void> => {
  return invoke("disable_addon", { id });
};
