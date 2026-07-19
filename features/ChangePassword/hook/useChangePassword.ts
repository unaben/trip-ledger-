import { SyntheticEvent, useCallback, useState } from "react";

function useChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(false);

      if (newPassword !== confirmPassword) {
        setError("New passwords don't match.");
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to change password");
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to change password"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [currentPassword, newPassword, confirmPassword]
  );

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    submitting,
    handleSubmit,
  };
}

export default useChangePassword;
