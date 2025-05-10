import { useEffect, useState } from "react";
import { Button } from "@aeromod/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@aeromod/ui/components/dialog";
import { Input } from "@aeromod/ui/components/input";
import type { Preset } from "../types";

interface CreatePresetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (preset: Preset) => void;
}

const initialPreset = {
  id: "",
  name: "",
  description: null,
  addons: [],
};

export function CreatePresetModal({
  open,
  onOpenChange,
  onCreate,
}: CreatePresetModalProps) {
  const [preset, setPreset] = useState<Preset>({
    id: "",
    name: "",
    description: null,
    addons: [],
  });
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  useEffect(() => {
    if (!open) {
      setPreset(initialPreset);
      setErrors({});
    }
  }, [open]);

  const handleChange =
    (field: keyof Preset) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPreset((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!preset.name.trim()) {
      setErrors((e) => ({ ...e, name: "Name is required." }));
      return;
    }

    onCreate(preset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Preset</DialogTitle>
          <DialogDescription>
            Create a new preset to save your current selection of enabled
            addons.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <p className="text-sm font-semibold">Name</p>
              <Input value={preset.name} onChange={handleChange("name")} />
              {errors?.name && (
                <span className="text-destructive text-sm">{errors.name}</span>
              )}
            </div>
            <div className="flex flex-col gap-y-2">
              <p className="text-sm font-semibold">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </p>
              <Input
                value={preset.description ?? ""}
                onChange={handleChange("description")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
