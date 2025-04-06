import { ipc } from "./ipc";

export interface Addon {
  id: string;
  name: string;
  creator: string;
  version: string;
  content_type: string;
  enabled: boolean;
  size: number;
}

export const getAddon = (id: string): Promise<Addon> => {
  return ipc("get_addon", { id });
};

export const getAddons = (): Promise<Addon[]> => {
  return ipc("get_addons");
};

export const installAddon = (): Promise<boolean> => {
  return ipc("install_addon");
};

export const enableAddon = (id: string): Promise<void> => {
  return ipc("enable_addon", { id });
};

export const disableAddon = (id: string): Promise<void> => {
  return ipc("disable_addon", { id });
};

export const uninstallAddon = (id: string): Promise<void> => {
  return ipc("uninstall_addon", { id });
};

export const revealAddon = (id: string): Promise<void> => {
  return ipc("reveal_addon", { id });
};

export interface VerificationResult {
  verified: boolean;
  files: VerificationNode[];
}

export interface VerificationNode {
  status: "Ok" | "SizeMismatch" | "NotFound";
  path: string;
  size: number;
}

export const verifyAddon = (id: string): Promise<VerificationResult> => {
  return ipc("verify_addon", { id });
};
