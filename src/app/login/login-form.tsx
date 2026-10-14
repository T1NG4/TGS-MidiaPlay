"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const configured = isSupabaseConfigured();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!configured) {
      setError("Supabase ainda não está configurado neste deploy.");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError("E-mail ou senha inválidos.");
        return;
      }
      router.replace(nextPath.startsWith("/") ? nextPath : "/painel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        E-mail
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-line bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Senha
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-line bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-accent py-2.5 text-sm font-medium text-background hover:bg-accent-dim disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
