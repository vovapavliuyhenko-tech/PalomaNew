"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={logout}
      className="rounded-md px-3 py-1.5 text-xs text-[var(--color-text-secondary-token)] underline-offset-4 hover:bg-black/5 hover:text-[var(--color-text-token)] hover:underline disabled:opacity-50"
    >
      Выйти
    </button>
  );
}
