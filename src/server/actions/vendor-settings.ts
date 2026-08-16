"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireVendorId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    throw new Error("Unauthorized");
  }
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id } });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor.id;
}

export async function updateVendorProfile(formData: FormData) {
  const vendorId = await requireVendorId();

  await prisma.vendorProfile.update({
    where: { id: vendorId },
    data: {
      brandName: String(formData.get("brandName") ?? ""),
      tagline: String(formData.get("tagline") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      logoImage: String(formData.get("logoImage") ?? "") || null,
      coverImage: String(formData.get("coverImage") ?? "") || null,
      contactEmail: String(formData.get("contactEmail") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      hqAddress: String(formData.get("hqAddress") ?? ""),
      shippingPolicy: String(formData.get("shippingPolicy") ?? ""),
      bespokePolicy: String(formData.get("bespokePolicy") ?? ""),
      orderNotificationsEnabled: formData.get("orderNotificationsEnabled") === "true",
      marketingUpdatesEnabled: formData.get("marketingUpdatesEnabled") === "true",
    },
  });

  revalidatePath("/vendor/settings/profile");
}
