import { Suspense } from "react";

import AdminLoginClient from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-16 max-w-sm rounded-[var(--radius-md)] border border-[var(--color-border-token)] bg-white p-6 text-center text-sm text-[var(--color-text-secondary-token)]">
          Загрузка…
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
