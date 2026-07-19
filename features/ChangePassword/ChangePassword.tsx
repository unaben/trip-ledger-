"use client";

import cn from "classnames";
import useChangePassword from "./hook/useChangePassword";
import styles from "./ChangePassword.module.css";

export function ChangePassword() {
  const {
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
  } = useChangePassword();

  return (
    <main className={styles.changePassword}>
      <h1>Change password</h1>

      <form className={styles.changePasswordForm} onSubmit={handleSubmit}>
        {error && (
          <p
            className={cn(
              styles.changePasswordMessage,
              styles.changePasswordMessageError
            )}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className={cn(
              styles.changePasswordMessage,
              styles.changePasswordMessageSuccess
            )}
          >
            Password updated.
          </p>
        )}

        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
