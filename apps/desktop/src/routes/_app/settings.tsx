import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { open } from "@tauri-apps/plugin-dialog";
import {
  AlertCircleIcon,
  FolderInputIcon,
  Loader2Icon,
  SaveIcon,
  UndoIcon,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@aeromod/ui/components/tabs";
import { Button } from "@aeromod/ui/components/button";
import { Switch } from "@aeromod/ui/components/switch";
import { Input } from "@aeromod/ui/components/input";
import { ModeToggle } from "@/components/mode-toggle";
import { useGetSettings, useUpdateSetting } from "@/features/settings/hooks";
import type { AppSettings } from "@/features/settings/types";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const {
    data: settings,
    isPending: isPendingSettings,
    isError: isErrorSettings,
    refetch: refetchSettings,
  } = useGetSettings();
  const { mutate: updateSetting, isPending: isPendingUpdate } =
    useUpdateSetting({ onSuccess: () => refetchSettings() });

  const [pendingSettings, setPendingSettings] = useState(settings);
  const hasChanges = useMemo(() => {
    if (!settings || !pendingSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(pendingSettings);
  }, [settings, pendingSettings]);

  useEffect(() => {
    if (settings) {
      setPendingSettings(settings);
    }
  }, [settings]);

  const handleSaveChanges = () => {
    if (!settings || !pendingSettings || !hasChanges) return;

    (Object.keys(pendingSettings) as (keyof AppSettings)[]).forEach((key) => {
      if (pendingSettings[key] !== settings[key]) {
        updateSetting({
          key,
          value: pendingSettings[key],
        });
      }
    });
  };

  const handleDiscardChanges = () => {
    setPendingSettings(settings);
  };

  if (isPendingSettings || !pendingSettings) {
    return (
      <div className="flex h-full flex-col gap-y-6 p-4">
        <div className="flex w-full">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        <div className="flex size-full items-center justify-center">
          <Loader2Icon className="size-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isErrorSettings) {
    return (
      <div className="flex h-full flex-col gap-y-6 p-4">
        <div className="flex w-full">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        <div className="flex size-full flex-col items-center justify-center gap-y-2">
          <AlertCircleIcon className="text-destructive size-8" />
          <p className="text-destructive">An error occured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <div className="flex size-full flex-col gap-y-6">
        <Tabs defaultValue="general" className="gap-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <div className="flex flex-col gap-y-4">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Enable</h3>
                  <p className="text-muted-foreground text-sm">
                    Automatically enable addons after installation.
                  </p>
                </div>
                <Switch
                  checked={pendingSettings.auto_enable}
                  onCheckedChange={(checked) =>
                    setPendingSettings((settings) => ({
                      ...settings!,
                      auto_enable: checked,
                    }))
                  }
                />
              </div>
              <div className="flex w-full items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Clear Scenery Indexes</h3>
                  <p className="text-muted-foreground text-sm">
                    Automatically clear scenery indexes after modifications.
                  </p>
                </div>
                <Switch
                  checked={pendingSettings.auto_clear_scenery_indexes}
                  onCheckedChange={(checked) =>
                    setPendingSettings((settings) => ({
                      ...settings!,
                      auto_clear_scenery_indexes: checked,
                    }))
                  }
                />
              </div>
              <SettingsItemPath
                name="Addons Directory"
                description="The directory where downloaded addons are stored."
                value={pendingSettings.addons_dir}
                onChange={(value) =>
                  setPendingSettings((settings) => ({
                    ...settings!,
                    addons_dir: value,
                  }))
                }
              />
              <SettingsItemPath
                name="Community Directory"
                description="The simulator directory where addons are linked."
                value={pendingSettings.community_dir}
                onChange={(value) =>
                  setPendingSettings((settings) => ({
                    ...settings!,
                    community_dir: value,
                  }))
                }
              />
            </div>
          </TabsContent>
          <TabsContent value="appearance">
            <div className="flex flex-col gap-y-4">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-muted-foreground text-sm">
                    Color scheme for the application interface.
                  </p>
                </div>
                <ModeToggle />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-auto flex justify-end gap-x-2 border-t pt-4">
          <Button
            variant="outline"
            disabled={!hasChanges || isPendingUpdate}
            onClick={handleDiscardChanges}
          >
            <UndoIcon />
            Discard
          </Button>
          <Button
            disabled={!hasChanges || isPendingUpdate}
            onClick={handleSaveChanges}
          >
            <SaveIcon />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SettingsItemPath {
  name: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

function SettingsItemPath({
  name,
  description,
  value,
  onChange,
}: SettingsItemPath) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex w-full flex-col gap-y-2">
      <h3 className="font-medium">{name}</h3>
      <form className="flex items-center gap-x-2">
        <Input value={value} onChange={handleChange} />
        <Button
          onClick={openFileDialog}
          disabled={isFileDialogOpen}
          variant="outline"
          size="icon"
          type="button"
        >
          <FolderInputIcon />
        </Button>
      </form>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
