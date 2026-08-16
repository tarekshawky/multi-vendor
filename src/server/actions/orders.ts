"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

async function requireVendorId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    throw new Error("Unauthorized");
  }
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id } });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor.id;
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const vendorId = await requireVendorId();
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const note = String(formData.get("note") ?? "");

  const order = await prisma.order.findFirst({ where: { id: orderId, vendorId } });
  if (!order) throw new Error("Order not found");

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderHistoryEvent.create({
      data: { orderId, status, note: note || undefined },
    }),
  ]);

  revalidatePath(`/vendor/orders/${orderId}`);
  revalidatePath("/vendor/orders");
}
