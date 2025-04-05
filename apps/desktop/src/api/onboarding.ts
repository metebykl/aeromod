import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "./settings";

export const getOnboardingStatus = (): Promise<boolean> => {
  return invoke("get_onboarding_status");
};

export const completeOnboarding = (settings: AppSettings): Promise<void> => {
  return invoke("complete_onboarding", { settings });
};
