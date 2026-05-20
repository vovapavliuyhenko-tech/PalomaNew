"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-[var(--radius-medium)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--color-cherry)] focus:outline-none";
const labelClass =
  "mb-1.5 block font-accent text-xs uppercase tracking-[var(--ls-widest)] text-[var(--text-secondary)]";

export default function ContactLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email, message }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) {
        window.alert("Не удалось отправить. Позвоните нам или напишите в Telegram.");
        return;
      }
      setDone(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center shadow-[var(--shadow-soft)]">
        <p className="mb-2 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)" }}>
          Спасибо!
        </p>
        <p className="font-accent text-sm text-[var(--text-secondary)]">Мы ответим в ближайшее время.</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="font-accent mt-6 text-sm text-[var(--color-cherry)] underline underline-offset-2"
        >
          Отправить ещё одно сообщение
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Имя *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required minLength={2} placeholder="Как к вам обращаться" />
      </div>
      <div>
        <label className={labelClass}>Телефон *</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          required
          minLength={8}
          type="tel"
          placeholder="+7 …"
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} type="email" placeholder="Если удобнее ответить письмом" />
      </div>
      <div>
        <label className={labelClass}>Сообщение</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} min-h-[120px] resize-none`}
          maxLength={3000}
          placeholder="Вопрос по букету, доставке, заказу…"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
        {loading ? "Отправка…" : "Отправить"}
      </button>
      <p className="font-accent text-[11px] leading-relaxed text-[var(--text-secondary)]">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <a href="/consent" className="text-[var(--color-cherry)] underline underline-offset-2">
          обработкой персональных данных
        </a>
        .
      </p>
    </form>
  );
}
