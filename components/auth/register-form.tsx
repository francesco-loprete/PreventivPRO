"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setSuccess(
      "Account creato. Se richiesta la conferma email, controlla la posta e poi accedi."
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block mb-2 text-muted text-sm">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@azienda.it"
          className="input-field"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block mb-2 text-muted text-sm">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimo 6 caratteri"
          className="input-field"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block mb-2 text-muted text-sm">
          Conferma password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ripeti la password"
          className="input-field"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-accent text-sm" role="status">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-4"
      >
        {loading ? "Registrazione..." : "Crea account"}
      </button>

      <p className="text-center text-sm text-muted">
        Hai già un account?{" "}
        <Link href="/login" className="text-accent hover:text-sky-400 font-medium">
          Accedi
        </Link>
      </p>
    </form>
  );
}
