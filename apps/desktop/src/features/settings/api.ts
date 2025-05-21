import { ipc } from "@/lib/ipc";
import type { AppSettings } from "./types";

export const DEFAULT_SETTINGS = {
  auto_enable: true,
  auto_clear_scenery_indexes: false,
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
