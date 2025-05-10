import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@aeromod/ui/components/menubar";
import { useConfirm } from "@/hooks/use-confirm";
import {
  useApplyPreset,
  useCreatePreset,
  useListPresets,
  useRemovePreset,
  useUpdatePreset,
} from "@/features/presets/hooks";
import { addonsKeys, getAddonsOptions } from "@/features/addons/hooks";
import type { Preset } from "@/features/presets/types";
import { CreatePresetModal } from "@/features/presets/components/create-preset-modal";

export function PresetMenu() {
  const queryClient = useQueryClient();

  const [modalId, setModalId] = useState<"create-preset" | null>(null);
  const [ConfirmDialog, confirm] = useConfirm();

  const { data: presets, refetch: refetchPresets } = useListPresets();
  const hasPreset = presets?.length === 0;

  const createPreset = useCreatePreset({
    onSuccess: () => {
      toast.success("Preset created successfully.");
      refetchPresets();
    },
  });
  const applyPreset = useApplyPreset({
    onSuccess: () => {
      toast.success("Preset created successfully.");
      queryClient.refetchQueries({ queryKey: addonsKeys.all });
    },
  });
  const updatePreset = useUpdatePreset({
    onSuccess: () => {
      toast.success("Preset updated successfully.");
      refetchPresets();
    },
  });
  const removePreset = useRemovePreset({
    onSuccess: () => {
      toast.success("Preset removed successfully.");
      refetchPresets();
    },
  });

  const getEnabledAddons = async () => {
    const options = getAddonsOptions();
    const addons = await queryClient.fetchQuery(options);
    const enabledAddons = addons.filter((a) => a.enabled).map((a) => a.id);

    return enabledAddons;
  };

  const handleCreatePreset = async (preset: Preset) => {
    const enabledAddons = await getEnabledAddons();
    preset.addons = enabledAddons;
    createPreset.mutate(preset);
  };

  const handleApplyPreset = (id: Preset["id"]) => {
    applyPreset.mutate(id);
  };

  const handleSaveToPreset = async (preset: Preset) => {
    const enabledAddons = await getEnabledAddons();
    preset.addons = enabledAddons;
    updatePreset.mutate(preset);
  };

  const handleRemovePreset = async (id: Preset["id"]) => {
    const ok = await confirm({
      title: `Are you sure?`,
      description: `This action cannot be undone. This will permanently remove preset '${id}.'`,
    });

    if (ok) {
      removePreset.mutate(id);
    }
  };

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger>Presets</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={() => setModalId("create-preset")}>
            New Preset...
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger disabled={hasPreset}>
              Apply Preset
            </MenubarSubTrigger>
            <MenubarSubContent className="max-w-2xl">
              {presets?.map((p) => (
                <MenubarItem
                  key={p.id}
                  onSelect={() => handleApplyPreset(p.id)}
                >
                  <p>{p.name}</p>
                  {p.description && (
                    <span className="text-muted-foreground truncate">
                      - {p.description}
                    </span>
                  )}
                </MenubarItem>
              ))}
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger disabled={hasPreset}>
              Save to Preset
            </MenubarSubTrigger>
            <MenubarSubContent className="max-w-2xl">
              {presets?.map((p) => (
                <MenubarItem key={p.id} onSelect={() => handleSaveToPreset(p)}>
                  <p>{p.name}</p>
                  {p.description && (
                    <span className="text-muted-foreground truncate">
                      - {p.description}
                    </span>
                  )}
                </MenubarItem>
              ))}
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger disabled={hasPreset}>
              Remove Preset
            </MenubarSubTrigger>
            <MenubarSubContent className="max-w-2xl">
              {presets?.map((p) => (
                <MenubarItem
                  key={p.id}
                  variant="destructive"
                  onSelect={() => handleRemovePreset(p.id)}
                >
                  <p>{p.name}</p>
                  {p.description && (
                    <span className="text-muted-foreground truncate">
                      - {p.description}
                    </span>
                  )}
                </MenubarItem>
              ))}
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <ConfirmDialog />
      <CreatePresetModal
        open={modalId === "create-preset"}
        onOpenChange={(open) => !open && setModalId(null)}
        onCreate={handleCreatePreset}
      />
    </>
  );
}
