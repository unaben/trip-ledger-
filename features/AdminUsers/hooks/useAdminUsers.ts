"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUser, NewUserInput, Status } from "../AdminUsers.types";

/** Talks to /api/admin/users on the server for the whole user-management page. */
export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const refetch = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to load users");
      setUsers((await response.json()) as AdminUser[]);
      setStatus("idle");
    } catch (err) {
      console.error("useAdminUsers: failed to load users:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  async function createUser(input: NewUserInput): Promise<string | null> {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return body.error ?? "Failed to create user";
      }
      await refetch();
      return null;
    } catch (err) {
      console.error("useAdminUsers: failed to create user:", err);
      return "Failed to create user";
    }
  }

  async function setActive(
    id: string,
    isActive: boolean
  ): Promise<string | null> {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return body.error ?? "Failed to update user";
      }
      await refetch();
      return null;
    } catch (err) {
      console.error("useAdminUsers: failed to update user:", err);
      return "Failed to update user";
    }
  }

  async function deleteUser(id: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        return body.error ?? "Failed to delete user";
      }
      await refetch();
      return null;
    } catch (err) {
      console.error("useAdminUsers: failed to delete user:", err);
      return "Failed to delete user";
    }
  }

  return { users, status, createUser, setActive, deleteUser };
}
