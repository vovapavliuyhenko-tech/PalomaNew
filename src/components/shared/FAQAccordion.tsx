"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;

        return (
          <div
            key={`${item.question}-${i}`}
            className="overflow-hidden rounded-[var(--radius-small)] border border-[var(--border)] bg-[var(--bg-card)]"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[var(--bg-secondary)]"
            >
              <span className="pr-4 text-sm font-medium text-[var(--text-primary)]">{item.question}</span>
              <ChevronDown
                size={16}
                className={`flex-shrink-0 text-[var(--color-cherry)] transition-transform duration-200 ease-out ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden
              />
            </button>

            <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-[var(--border)] px-5 pb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  <div className="pt-3">{item.answer}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
