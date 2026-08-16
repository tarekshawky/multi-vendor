import { Icon } from "./icons/Icon";
import type { ReactNode } from "react";

type AccordionItemProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  return (
    <details className="group border-b border-outline-variant/30 py-6" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-label-caps text-label-caps uppercase tracking-widest text-primary">
        {title}
        <Icon name="add" className="transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pt-4 font-body-lg text-body-lg text-on-surface-variant">{children}</div>
    </details>
  );
}
