import { ipc } from "@/lib/ipc";
import type { AppSettings } from "@/features/settings/types";

export const getOnboardingStatus = (): Promise<boolean> => {
  return ipc("get_onboarding_status");
};

export const completeOnboarding = (settings: AppSettings): Promise<void> => {
  return ipc("complete_onboarding", { settings });
};
