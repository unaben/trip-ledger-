import { useCallback, useState } from "react";
import { useAdminUsers } from "./useAdminUsers";
import type { AdminUser, PendingAction, UserRole } from "../AdminUsers.types";

/**
 * Wraps useAdminUsers with the page-level state for the admin "manage
 * users" screen: the create-user form, the reactivate/deactivate/delete
 * actions, and the confirmation-modal flow that guards the destructive ones.
 */
export function useAdminUsersPage() {
  const { users, status, createUser, setActive, deleteUser } = useAdminUsers();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );

  const handleCreate = useCallback(
    async (e: React.SubmitEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setFormError(null);

      const error = await createUser({ email, password, role });
      if (error) {
        setFormError(error);
      } else {
        setEmail("");
        setPassword("");
        setRole("user");
      }
      setSubmitting(false);
    },
    [createUser, email, password, role]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;
    setActionError(null);

    const error =
      pendingAction.type === "deactivate"
        ? await setActive(pendingAction.user.id, false)
        : await deleteUser(pendingAction.user.id);

    if (error) setActionError(error);
    setPendingAction(null);
  }, [pendingAction, setActive, deleteUser]);

  const handleReactivate = useCallback(
    async (user: AdminUser) => {
      setActionError(null);
      const error = await setActive(user.id, true);
      if (error) setActionError(error);
    },
    [setActive]
  );

  return {
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
  };
}
