
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/context";

/**
 * Loads the current session user (skipped on /login) and exposes a
 * logout action. Used by AppNav, which renders nothing until a user
 * is loaded - proxy.ts handles redirecting to /login when there isn't one.
 */
export function useAuthUser() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("AppNav: logout request failed:", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return { user, pathname, handleLogout };
}