import { type MutateOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { completeOnboarding } from "@/api/onboarding";
import type { AppSettings } from "@/api/settings";

export const useCompleteOnboarding = (
  options?: MutateOptions<void, Error, AppSettings, unknown>
) => {
  return useMutation({
    mutationFn: completeOnboarding,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};
