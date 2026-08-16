"use client";

import { cn } from "@/lib/cn";
import { Icon } from "./icons/Icon";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 border-t border-outline-variant/30 pt-8",
        className,
      )}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Previous page"
      >
        <Icon name="chevron_left" className="rtl:rotate-180" />
      </button>
      <div className="flex gap-2">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full font-body-md text-body-md transition-colors",
              p === page
                ? "bg-primary text-on-primary"
                : "text-on-surface hover:bg-surface-container-high",
            )}
          >
            {p}
          </button>
        ))}
        {totalPages > pages.length && (
          <span className="flex h-10 w-10 items-center justify-center font-body-md text-body-md text-on-surface-variant">
            …
          </span>
        )}
      </div>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="p-2 text-primary hover:opacity-70 transition-opacity disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Next page"
      >
        <Icon name="chevron_right" className="rtl:rotate-180" />
      </button>
    </div>
  );
}
