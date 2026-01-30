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

/**
 * Custom hook for non-blocking confirmation dialogs
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
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  const Dialog = () => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>{config.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {config.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {config.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, Dialog };
}
