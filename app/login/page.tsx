"use client";

import useLoginSubmit from "./hooks/useLoginSubmit";
import styles from "./login.module.css";

export default function LoginPage() {
  const {
    handleSubmit,
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
  } = useLoginSubmit();

  return (
    <main className={styles.login}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <h1 className={styles.loginTitle}>Log in</h1>
        {error && <p className={styles.loginError}>{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
