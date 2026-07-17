export interface ConfirmationModalProps {
  /** Whether the modal is visible. Renders nothing when false. */
  isOpen: boolean;
  title: string;
  message: string;
  /** Defaults to "Confirm". */
  confirmLabel?: string;
  /** Defaults to "Cancel". */
  cancelLabel?: string;
  /** "danger" styles the confirm button for destructive actions (e.g. delete). */
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}
