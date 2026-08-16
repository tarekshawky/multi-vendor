"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@/generated/prisma/client";

async function requireVendorId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    throw new Error("Unauthorized");
  }
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id } });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor.id;
}

function computeStatus(validFrom: Date, validUntil: Date) {
  const now = new Date();
  if (now < validFrom) return "SCHEDULED" as const;
  if (now > validUntil) return "EXPIRED" as const;
  return "ACTIVE" as const;
}

export async function createPromoCode(formData: FormData) {
  const vendorId = await requireVendorId();

  const code = String(formData.get("code") ?? "").toUpperCase().trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const discountType = String(formData.get("discountType") ?? "PERCENT") as DiscountType;
  const discountValue = Number(formData.get("discountValue") ?? 0);
  const minOrderValueRaw = String(formData.get("minOrderValue") ?? "");
  const usageLimitRaw = String(formData.get("usageLimit") ?? "");
  const validFrom = new Date(String(formData.get("validFrom") ?? new Date().toISOString()));
  const validUntil = new Date(String(formData.get("validUntil") ?? new Date().toISOString()));

  if (!code || !title) throw new Error("Code and title are required");

  await prisma.promoCode.create({
    data: {
      vendorId,
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValueRaw ? Number(minOrderValueRaw) : null,
      usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
      validFrom,
      validUntil,
      status: computeStatus(validFrom, validUntil),
    },
  });

  revalidatePath("/vendor/promotions");
}

export async function deactivatePromoCode(promoId: string) {
  const vendorId = await requireVendorId();
  const promo = await prisma.promoCode.findFirst({ where: { id: promoId, vendorId } });
  if (!promo) throw new Error("Promo code not found");

  await prisma.promoCode.update({ where: { id: promoId }, data: { status: "EXPIRED", validUntil: new Date() } });
  revalidatePath("/vendor/promotions");
}
