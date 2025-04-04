import { invoke } from "@tauri-apps/api/core";

export interface Addon {
  id: string;
  name: string;
  creator: string;
  version: string;
  content_type: string;
  enables: boolean;
  size: number;
}

export const getAddons = (): Promise<Addon[]> => {
  return invoke("get_addons");
};
