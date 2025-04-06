import { ipc } from "./ipc";
import type { AppSettings } from "./settings";

export const getOnboardingStatus = (): Promise<boolean> => {
  return ipc("get_onboarding_status");
};

export const completeOnboarding = (settings: AppSettings): Promise<void> => {
  return ipc("complete_onboarding", { settings });
};
