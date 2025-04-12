import { useState } from "react";
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

interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  initialValue?: string;
}

type PromptPromise = (options: PromptOptions) => Promise<string>;

export const usePrompt = (): [() => React.JSX.Element, PromptPromise] => {
  const [options, setOptions] = useState<PromptOptions>({
    title: "",
  });

  const [promise, setPromise] = useState<{
    resolve: (value: string) => void;
  } | null>(null);

  const prompt = (options: PromptOptions) => {
    setOptions(options);
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    reset();
    setPromise(null);
  };

  const handleConfirm = (value: string) => {
    reset();
    promise?.resolve(value);
    handleClose();
  };

  const reset = () => {
    setOptions({ title: "", description: undefined });
  };

  const PromptDialog = () => {
    const [value, setValue] = useState<string>(options.initialValue ?? "");

    return (
      <Dialog open={promise !== null} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{options.title}</DialogTitle>
            {options.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirm(value);
            }}
          >
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={options.placeholder}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return [PromptDialog, prompt as PromptPromise];
};
