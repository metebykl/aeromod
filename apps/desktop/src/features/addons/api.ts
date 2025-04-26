import { ipc } from "@/lib/ipc";
import type { Addon, VerificationResult } from "./types";

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

export const renameAddon = (id: string, newId: string): Promise<void> => {
  return ipc("rename_addon", { id, newId });
};

export const revealAddon = (id: string): Promise<void> => {
  return ipc("reveal_addon", { id });
};

export const verifyAddon = (id: string): Promise<VerificationResult> => {
  return ipc("verify_addon", { id });
};
