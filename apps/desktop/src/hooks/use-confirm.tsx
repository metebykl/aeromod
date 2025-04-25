import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@aeromod/ui/components/alert-dialog";

interface ConfirmOptions {
  title: string;
  description: string;
}

export const useConfirm = (): [
  () => React.JSX.Element,
  (options: ConfirmOptions) => Promise<unknown>,
] => {
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    description: "",
  });

  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions) => {
    setOptions(options);
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    reset();
    setPromise(null);
  };

  const handleConfirm = () => {
    reset();
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    reset();
    promise?.resolve(false);
    handleClose();
  };

  const reset = () => {
    setOptions({ title: "", description: "" });
  };

  const ConfirmationDialog = () => {
    return (
      <AlertDialog open={promise !== null} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return [ConfirmationDialog, confirm];
};
