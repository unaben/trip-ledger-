"use client";

import cn from "classnames";
import { useAdminUsersPage } from "./hooks/useAdminUsersPage";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import { UserRole } from "./AdminUsers.types";
import styles from "./AdminUsers.module.css";

export function AdminUsers() {
  const {
    users,
    status,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    formError,
    submitting,
    actionError,
    pendingAction,
    setPendingAction,
    handleCreate,
    handleConfirmAction,
    handleReactivate,
  } = useAdminUsersPage();

  return (
    <main className={styles.adminUsers}>
      <h1>Manage users</h1>

      {actionError && (
        <p
          className={cn(styles.adminUsersStatus, styles.adminUsersStatusError)}
        >
          {actionError}
        </p>
      )}
      {status === "loading" && (
        <p className={styles.adminUsersStatus}>Loading users…</p>
      )}
      {status === "error" && (
        <p
          className={cn(styles.adminUsersStatus, styles.adminUsersStatusError)}
        >
          Couldn&apos;t load users.
        </p>
      )}

      {status === "idle" && (
        <table className={styles.adminUsersTable}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? "Active" : "Deactivated"}</td>
                <td className={styles.adminUsersActions}>
                  {user.isActive ? (
                    <button
                      type="button"
                      className={cn(
                        styles.adminUsersButton,
                        styles.adminUsersButtonWarn
                      )}
                      onClick={() =>
                        setPendingAction({ type: "deactivate", user })
                      }
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.adminUsersButton}
                      onClick={() => handleReactivate(user)}
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    type="button"
                    className={cn(
                      styles.adminUsersButton,
                      styles.adminUsersButtonDanger
                    )}
                    onClick={() => setPendingAction({ type: "delete", user })}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>Add user</h2>
      <form className={styles.adminUsersForm} onSubmit={handleCreate}>
        {formError && (
          <p
            className={cn(
              styles.adminUsersStatus,
              styles.adminUsersStatusError
            )}
          >
            {formError}
          </p>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Temporary password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="user">User (read-only)</option>
            <option value="admin">Admin (full access)</option>
          </select>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create user"}
        </button>
      </form>

      <ConfirmationModal
        isOpen={pendingAction !== null}
        title={
          pendingAction?.type === "delete" ? "Delete user?" : "Deactivate user?"
        }
        message={
          pendingAction?.type === "delete"
            ? `Permanently delete "${pendingAction.user.email}"? This can't be undone.`
            : `Deactivate "${pendingAction?.user.email}"? They'll lose access immediately.`
        }
        confirmLabel={
          pendingAction?.type === "delete" ? "Delete" : "Deactivate"
        }
        tone="danger"
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </main>
  );
}
