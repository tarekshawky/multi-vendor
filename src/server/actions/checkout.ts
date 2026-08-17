"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PaymentMethod } from "@/generated/prisma/client";

export type CheckoutLineInput = {
  productId: string;
  qty: number;
  color?: string;
  size?: string;
};

export type CheckoutPaymentInput = {
  method: PaymentMethod;
  cardLast4?: string;
};

export type CheckoutResult =
  | { ok: true; orderNumbers: string[] }
  | { ok: false; error: "unauthenticated" | "empty" | "invalid" | "invalidPayment" };

async function generateOrderNumber() {
  let orderNumber: string;
  let exists: unknown;
  do {
    orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    exists = await prisma.order.findUnique({ where: { orderNumber }, select: { id: true } });
  } while (exists);
  return orderNumber;
}

export async function checkoutCart(
  lines: CheckoutLineInput[],
  payment: CheckoutPaymentInput,
): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "unauthenticated" };
  }
  if (!lines.length) {
    return { ok: false, error: "empty" };
  }
  if (!["CARD", "COD", "WALLET"].includes(payment.method)) {
    return { ok: false, error: "invalidPayment" };
  }
  if (payment.method === "CARD" && !/^\d{4}$/.test(payment.cardLast4 ?? "")) {
    return { ok: false, error: "invalidPayment" };
  }

  const productIds = lines.map((l) => l.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const groupedByVendor = new Map<string, { line: CheckoutLineInput; product: (typeof products)[number] }[]>();
  for (const line of lines) {
    const product = productMap.get(line.productId);
    if (!product || line.qty <= 0) continue;
    const group = groupedByVendor.get(product.vendorId) ?? [];
    group.push({ line, product });
    groupedByVendor.set(product.vendorId, group);
  }

  if (groupedByVendor.size === 0) {
    return { ok: false, error: "invalid" };
  }

  const orderNumbers: string[] = [];

  const paymentNote =
    payment.method === "CARD"
      ? `Order placed — paid by card ending ${payment.cardLast4}`
      : payment.method === "COD"
        ? "Order placed — cash on delivery"
        : "Order placed — mobile wallet (Egypt)";

  for (const [vendorId, group] of groupedByVendor) {
    const subtotal = group.reduce((sum, { line, product }) => sum + Number(product.price) * line.qty, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax;
    const orderNumber = await generateOrderNumber();
    const currency = group[0].product.currency;

    await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        vendorId,
        status: "PENDING",
        subtotal,
        shipping: 0,
        tax,
        total,
        currency,
        paymentMethod: payment.method,
        paymentMethodLast4: payment.method === "CARD" ? payment.cardLast4 : null,
        items: {
          create: group.map(({ line, product }) => ({
            productId: product.id,
            titleSnapshot: product.name,
            imageSnapshot: product.images[0] ?? null,
            color: line.color,
            size: line.size,
            qty: line.qty,
            price: product.price,
          })),
        },
        historyEvents: {
          create: [{ status: "PENDING", note: paymentNote }],
        },
      },
    });

    await Promise.all(
      group.map(({ line, product }) =>
        prisma.product.update({ where: { id: product.id }, data: { unitsSold: { increment: line.qty }, stock: { decrement: Math.min(line.qty, product.stock) } } }),
      ),
    );

    orderNumbers.push(orderNumber);
  }

  revalidatePath("/vendor/dashboard");
  revalidatePath("/vendor/orders");

  return { ok: true, orderNumbers };
}
