import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { open } from "@tauri-apps/plugin-dialog";
import { AlertCircleIcon, FolderInputIcon, Loader2Icon } from "lucide-react";

import { Button } from "@aeromod/ui/components/button";
import { Checkbox } from "@aeromod/ui/components/checkbox";
import { Input } from "@aeromod/ui/components/input";
import { ModeToggle } from "@/components/mode-toggle";
import { useGetSettings, useUpdateSetting } from "@/hooks/settings";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const {
    data: settings,
    status: settingsStatus,
    refetch: refetchSettings,
  } = useGetSettings();

  // TODO: invalidate cache after updating settings
  const updateMutation = useUpdateSetting({
    onSuccess: () => refetchSettings(),
  });

  if (settingsStatus === "pending") {
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

  if (settingsStatus === "error") {
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
    <div className="flex h-full flex-col gap-y-6 p-4">
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <div className="flex flex-col gap-y-4">
        <div className="flex w-full items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Theme</h3>
            <p className="text-muted-foreground">
              Color scheme for the application interface.
            </p>
          </div>
          <ModeToggle />
        </div>
        <div className="flex w-full items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Auto Enable</h3>
            <p className="text-muted-foreground">
              Automatically enable addons after installation.
            </p>
          </div>
          <Checkbox
            checked={settings.auto_enable}
            onCheckedChange={(checked) => {
              if (checked === "indeterminate") return;
              updateMutation.mutate({ key: "auto_enable", value: checked });
            }}
          />
        </div>
        <SettingsItemPath
          name="Addons Directory"
          description="The directory where downloaded addons are stored."
          initialValue={settings.addons_dir}
          onSave={(value) =>
            updateMutation.mutate({ key: "addons_dir", value })
          }
        />
        <SettingsItemPath
          name="Community Directory"
          description="The simulator directory where addons are linked."
          initialValue={settings.community_dir}
          onSave={(value) =>
            updateMutation.mutate({ key: "community_dir", value })
          }
        />
      </div>
    </div>
  );
}

interface SettingsItemPath {
  name: string;
  description: string;
  initialValue: string;
  onSave: (value: string) => void;
}

function SettingsItemPath({
  name,
  description,
  initialValue,
  onSave,
}: SettingsItemPath) {
  const [value, setValue] = useState(initialValue);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const isModified = value === initialValue;

  const openFileDialog = async () => {
    setIsFileDialogOpen(true);

    try {
      const path = await open({
        multiple: false,
        directory: true,
      });

      if (path) {
        setValue(path);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFileDialogOpen(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(value);
  };

  return (
    <div className="flex w-full flex-col gap-y-2">
      <h3 className="text-lg font-medium">{name}</h3>
      <form onSubmit={onSubmit} className="flex items-center gap-x-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button
          onClick={openFileDialog}
          disabled={isFileDialogOpen}
          variant="outline"
          size="icon"
          type="button"
        >
          <FolderInputIcon />
        </Button>
        <Button type="submit" disabled={isModified}>
          Save
        </Button>
      </form>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
