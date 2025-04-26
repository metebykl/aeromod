import { type MutateOptions, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppSettings } from "@/features/settings/types";
import { completeOnboarding } from "./api";

export const useCompleteOnboarding = (
  options?: MutateOptions<void, Error, AppSettings, unknown>
) => {
  return useMutation({
    mutationFn: completeOnboarding,
    onError: (e) => toast.error(e.message),
    ...options,
  });
};
