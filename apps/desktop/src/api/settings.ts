import { ipc } from "./ipc";

export interface AppSettings {
  addons_dir: string;
  community_dir: string;
  auto_enable: boolean;
}

export const DEFAULT_SETTINGS = {
  auto_enable: true,
};

export const getSettings = (): Promise<AppSettings> => {
  return ipc("get_settings");
};

export const updateSetting = <T extends keyof AppSettings>(
  key: T,
  value: AppSettings[T]
): Promise<void> => {
  let data: unknown = value;
  if (typeof value === "boolean") {
    data = value ? "true" : "false";
  }

  return ipc("update_setting", { key, value: data });
};
