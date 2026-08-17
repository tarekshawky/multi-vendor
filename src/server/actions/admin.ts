"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { VendorStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function updateVendorStatus(vendorId: string, status: VendorStatus) {
  await requireAdmin();
  await prisma.vendorProfile.update({ where: { id: vendorId }, data: { status } });
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/dashboard");
}
