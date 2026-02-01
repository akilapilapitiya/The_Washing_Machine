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
import {
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";

/**
 * Variant configurations for confirmation dialogs
 */
const VARIANTS = {
  destructive: {
    icon: XCircle,
    buttonClass: "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
    iconClass: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    buttonClass:
      "bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50",
    iconClass: "text-amber-600",
  },
  info: {
    icon: Info,
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50",
    iconClass: "text-blue-600",
  },
  success: {
    icon: CheckCircle,
    buttonClass:
      "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50",
    iconClass: "text-green-600",
  },
};

/**
 * Custom hook for non-blocking confirmation dialogs with variants and loading state
 * Replaces window.confirm() with a modern, accessible AlertDialog
 *
 * @returns {object} - confirm function and Dialog component
 *
 * @example
 * const { confirm, Dialog } = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     variant: "destructive",
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
    variant: "destructive",
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    showIcon: true,
  });
  const [resolver, setResolver] = useState(null);

  /**
   * Opens confirmation dialog and returns a promise
   * @param {object} options - Dialog configuration
   * @param {string} [options.variant="destructive"] - Dialog variant: "destructive", "warning", "info", "success"
   * @param {string} options.title - Dialog title
   * @param {string} options.description - Dialog description
   * @param {string} [options.confirmText="Confirm"] - Confirm button text
   * @param {string} [options.cancelText="Cancel"] - Cancel button text
   * @param {boolean} [options.showIcon=true] - Show variant icon
   * @returns {Promise<boolean>} - true if confirmed, false if canceled
   */
  const confirm = ({
    variant = "destructive",
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    showIcon = true,
  }) => {
    return new Promise((resolve) => {
      setConfig({
        variant,
        title,
        description,
        confirmText,
        cancelText,
        showIcon,
      });
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
    if (resolver) {
      resolver(false);
      setResolver(null); // Clear resolver after use
    }
  };

  const MemoizedDialog = () => {
    const variantConfig = VARIANTS[config.variant] || VARIANTS.destructive;
    const Icon = variantConfig.icon;

    return (
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
            <AlertDialogTitle className="flex items-center gap-2">
              {config.showIcon && (
                <Icon className={`h-5 w-5 ${variantConfig.iconClass}`} />
              )}
              {config.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {config.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              disabled={isLoading}
            >
              {config.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isLoading}
              className={variantConfig.buttonClass}
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
  };

  return { confirm, Dialog: MemoizedDialog };
}
