"use client";

import Link from "next/link";
import { useAuthUser } from "./hook/useAuthUser";
import styles from "./AppNav.module.css";

 function AppNav() {
  const { user, pathname, handleLogout } = useAuthUser();

  if (pathname === "/login" || !user) return null;

  return (
    <nav className={styles.appNav}>
      <div className={styles.appNavLinks}>
        <Link className={styles.appNavLink} href="/trips">
          Trips
        </Link>
        {user.role === "admin" && (
          <a className={styles.appNavLink} href="/admin/users">
            Manage users
          </a>
        )}
        <a className={styles.appNavLink} href="/account">
          Account
        </a>
      </div>
      <div className={styles.appNavUser}>
        <span className={styles.appNavEmail}>{user.email}</span>
        <span className={styles.appNavRole}>{user.role}</span>
        <button
          type="button"
          className={styles.appNavLogout}
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
export default AppNav