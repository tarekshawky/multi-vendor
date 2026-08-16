"use client";

import { useRef, useState, useTransition } from "react";
import { updateOrderStatus } from "@/server/actions/orders";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type OrderStatusUpdateProps = {
  orderId: string;
  currentStatus: string;
  labels: { status: string; note: string; update: string };
};

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusUpdate({ orderId, currentStatus, labels }: OrderStatusUpdateProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateOrderStatus(orderId, formData);
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <Button type="button" variant="secondary" onClick={() => setOpen((v) => !v)}>
        {labels.update}
      </Button>
      {open && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="absolute end-0 top-full mt-2 z-20 w-72 bg-surface-container-lowest border border-outline-variant/30 p-4 space-y-4 shadow-lg"
        >
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.status}
            </label>
            <Select name="status" defaultValue={currentStatus}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.note}
            </label>
            <input
              name="note"
              className="input-editorial font-body-md text-sm text-primary"
              placeholder={labels.note}
            />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={pending}>
            {labels.update}
          </Button>
        </form>
      )}
    </div>
  );
}
