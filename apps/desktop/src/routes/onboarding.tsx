import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderInputIcon,
} from "lucide-react";

import { Button } from "@aeromod/ui/components/button";
import { Input } from "@aeromod/ui/components/input";
import { type AppSettings, DEFAULT_SETTINGS } from "@/api/settings";
import { useCompleteOnboarding } from "@/hooks/onboarding";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const [settings, setSettings] = useState<AppSettings>({
    addons_dir: "",
    community_dir: "",
    auto_enable: DEFAULT_SETTINGS.auto_enable,
  });

  const { mutate, isPending } = useCompleteOnboarding({
    onSuccess: () => navigate({ to: "/" }),
    onError: () => navigate({ reloadDocument: true }),
  });

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col">
        <h1 className="text-2xl font-bold">Welcome to AeroMod!</h1>
        <div className="flex flex-col gap-y-3">
          {active === 0 && (
            <>
              <OnboardingItemPath
                description="Please select the directory where your addons will be stored."
                placeholder="Addons Directory Path"
                value={settings.addons_dir}
                onChange={(v) => setSettings((s) => ({ ...s, addons_dir: v }))}
              />
              <Button
                variant="outline"
                size="lg"
                disabled={settings.addons_dir === ""}
                onClick={() => setActive(1)}
              >
                Next
                <ChevronRightIcon />
              </Button>
            </>
          )}
          {active === 1 && (
            <>
              <OnboardingItemPath
                description="Please select the simulator directory where addons are linked."
                placeholder="Community Directory Path"
                value={settings.community_dir}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, community_dir: v }))
                }
              />
              <div className="flex items-center gap-x-2">
                <Button
                  className="w-1/2"
                  variant="outline"
                  size="lg"
                  disabled={isPending}
                  onClick={() => setActive(0)}
                >
                  <ChevronLeftIcon />
                  Back
                </Button>
                <Button
                  className="w-1/2"
                  size="lg"
                  disabled={isPending ?? settings.community_dir === ""}
                  onClick={() => mutate(settings)}
                >
                  Get Started
                  <CheckCircleIcon />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

interface OnboardingItemPath {
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function OnboardingItemPath({
  description,
  placeholder,
  value,
  onChange,
}: OnboardingItemPath) {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const openFileDialog = async () => {
    setIsFileDialogOpen(true);

    try {
      const path = await open({
        multiple: false,
        directory: true,
      });

      if (path) {
        onChange(path);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFileDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <p className="text-muted-foreground">{description}</p>
      <div className="flex items-center gap-x-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <Button
          onClick={openFileDialog}
          disabled={isFileDialogOpen}
          variant="outline"
          size="icon"
        >
          <FolderInputIcon />
        </Button>
      </div>
    </div>
  );
}
