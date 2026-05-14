"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/Input";

function safeAdminNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/admin")) return "/admin";
  return raw;
}

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeAdminNext(searchParams.get("next"));

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Не удалось войти.");
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm space-y-6 rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white p-6 shadow-lg">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Вход в админ-панель</h1>
        <p className="mt-2 text-xs text-[var(--color-text-secondary-token)]">
          Задайте переменную окружения <span className="font-mono">ADMIN_PANEL_PASSWORD</span> на сервере. Опционально{" "}
          <span className="font-mono">ADMIN_SESSION_SECRET</span> для подписи cookie.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Input
          label="Пароль"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="flex w-full min-h-[48px] items-center justify-center rounded-[var(--radius-small)] bg-[var(--color-accent-primary)] px-5 text-white disabled:opacity-60"
        >
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
