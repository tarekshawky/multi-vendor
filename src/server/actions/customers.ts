"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireVendor() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    throw new Error("Unauthorized");
  }
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id } });
  if (!vendor) throw new Error("Vendor profile not found");
  return { vendorId: vendor.id, userId: session.user.id };
}

export async function addCustomerNote(customerId: string, formData: FormData) {
  const { vendorId, userId } = await requireVendor();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.note.create({
    data: { vendorId, customerId, authorId: userId, body },
  });

  revalidatePath(`/vendor/customers/${customerId}`);
}
