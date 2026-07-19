export type UserRole = "admin" | "user";

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface NewUserInput {
  email: string;
  password: string;
  role: UserRole;
}

export type PendingAction =
| { type: "deactivate"; user: AdminUser }
| { type: "delete"; user: AdminUser };


export type Status = "loading" | "idle" | "error";