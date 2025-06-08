import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

interface LoginPageProps {
  isRegistering?: boolean;
  onAuthSuccess: (token: string) => void;
}

export function LoginPage({
  isRegistering = false,
  onAuthSuccess,
}: LoginPageProps) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = isRegistering ? "/auth/register" : "/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.message || data?.error || "Request failed";
        setError(msg);
      } else {
        const data = await res.json();
        onAuthSuccess(data.token);
        navigate("/"); 
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h2>
        {isRegistering ? "Register a new account" : "Login"}
      </h2>
      <form className="LoginPage-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isRegistering ? "Register" : "Login"}
        </button>

        {error && (
          <div className="LoginPage-error" aria-live="polite">
            {error}
          </div>
        )}

        {!isRegistering && (
          <p>
            Don’t have an account?{" "}
            <Link to="/register">Register here</Link>
          </p>
        )}
      </form>
    </>
  );
}
