"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icons/Icon";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("Search");
  const router = useRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const term = value.trim();
    onClose();
    router.push(term ? `/collections?q=${encodeURIComponent(term)}` : "/collections");
  }

  return (
    <div className="fixed inset-0 z-[60] bg-surface/95 backdrop-blur-xl flex flex-col items-center justify-start pt-32 md:pt-48 px-margin-mobile md:px-margin-desktop">
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute top-6 end-6 md:top-10 md:end-10 text-primary hover:opacity-70 transition-opacity"
      >
        <Icon name="close" size={28} />
      </button>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="flex items-center gap-4 border-b border-primary pb-4">
          <Icon name="search" size={28} className="text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full bg-transparent font-display text-headline-sm md:text-headline-lg text-primary placeholder:text-on-surface-variant/50 outline-none"
          />
        </div>
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mt-6">
          {t("hint")}
        </p>
      </form>
    </div>
  );
}
