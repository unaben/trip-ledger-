"use client";

import { useEffect, useId, useRef } from "react";
import cn from "classnames";
import type { ConfirmationModalProps } from "./ConfirmationModal.types";
import styles from "./ConfirmationModal.module.css";

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const titleId = useId();
  const messageId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    confirmButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.confirmationModalOverlay}
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={styles.confirmationModal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={styles.confirmationModalTitle}>
          {title}
        </h2>
        <p id={messageId} className={styles.confirmationModalMessage}>
          {message}
        </p>
        <div className={styles.confirmationModalActions}>
          <button
            type="button"
            className={cn(
              styles.confirmationModalButton,
              styles.confirmationModalButtonCancel
            )}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            className={cn(styles.confirmationModalButton, {
              [styles.confirmationModalButtonDanger]: tone === "danger",
              [styles.confirmationModalButtonConfirm]: tone !== "danger",
            })}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ConfirmationModal;
