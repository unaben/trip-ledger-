import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

const useLoginSubmit = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
  
    const handleSubmit = useCallback(
      async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
  
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
  
          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error ?? "Failed to log in");
          }
  
          router.push("/trips");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to log in");
        } finally {
          setSubmitting(false);
        }
      },
      [email, password, router]
    );
  
    return {
      handleSubmit,
      email,
      setEmail,
      password,
      setPassword,
      error,
      setError,
      submitting,
      setSubmitting,
    };
  };
  
  export default useLoginSubmit;