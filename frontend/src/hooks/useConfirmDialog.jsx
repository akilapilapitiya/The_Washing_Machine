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
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

/**
 * Custom hook for non-blocking confirmation dialogs with loading state
 * Replaces window.confirm() with a modern, accessible AlertDialog
 *
 * @returns {object} - confirm function and Dialog component
 *
 * @example
 * const { confirm, Dialog } = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "Delete Item?",
 *     description: "This action cannot be undone.",
 *     confirmText: "Delete",
 *     cancelText: "Cancel"
 *   });
 *
 *   if (confirmed) {
 *     // Proceed with deletion
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <Dialog />
 *   </>
 * );
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
  });
  const [resolver, setResolver] = useState(null);

  /**
   * Opens confirmation dialog and returns a promise
   * @param {object} options - Dialog configuration
   * @param {string} options.title - Dialog title
   * @param {string} options.description - Dialog description
   * @param {string} [options.confirmText="Confirm"] - Confirm button text
   * @param {string} [options.cancelText="Cancel"] - Cancel button text
   * @returns {Promise<boolean>} - true if confirmed, false if canceled
   */
  const confirm = ({
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
  }) => {
    return new Promise((resolve) => {
      setConfig({ title, description, confirmText, cancelText });
      setIsOpen(true);
      setIsLoading(false);
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsLoading(true);
    // Keep dialog open briefly to show loading state
    setTimeout(() => {
      setIsOpen(false);
      setIsLoading(false);
      if (resolver) resolver(true);
    }, 300);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setIsLoading(false);
    if (resolver) resolver(false);
  };

  const Dialog = () => (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          handleCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>{config.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {config.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              config.confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, Dialog };
}
