"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/navigation";
import { slugify } from "@/lib/slug";
import type { VendorStatus, OrderStatus } from "@/generated/prisma/client";

export type AdminActionState = { error?: string } | undefined;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function isForeignKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2003";
}

// ---- Staff Users (Admin / Writer / Vendor, created directly by an admin) ----

export async function createStaffUser(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const role = String(formData.get("role") ?? "") as "ADMIN" | "WRITER" | "VENDOR";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (!["ADMIN", "WRITER", "VENDOR"].includes(role) || !name || !email || password.length < 8) {
    return { error: "invalidInput" };
  }
  if (role === "VENDOR" && !String(formData.get("brandName") ?? "").trim()) {
    return { error: "invalidInput" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "emailTaken" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (role === "VENDOR") {
    const brandName = String(formData.get("brandName") ?? "").trim();
    const currency = String(formData.get("currency") ?? "USD");
    const baseSlug = slugify(brandName) || "vendor";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.vendorProfile.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "VENDOR",
        vendorProfile: { create: { brandName, slug, currency, status: "ACTIVE" } },
      },
    });
  } else {
    await prisma.user.create({ data: { name, email, passwordHash, role } });
  }

  revalidatePath("/admin/users");
  redirect({ href: "/admin/users", locale });
}

export async function deleteStaffUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  if (session.user.id === userId) {
    return { ok: false, error: "cannotDeleteSelf" };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      return { ok: false, error: "hasOrders" };
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

// ---- Vendors ----

export async function updateVendorStatus(vendorId: string, status: VendorStatus) {
  await requireAdmin();
  await prisma.vendorProfile.update({ where: { id: vendorId }, data: { status } });
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/dashboard");
}

export async function createVendor(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const brandName = String(formData.get("brandName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const currency = String(formData.get("currency") ?? "USD");
  const locale = String(formData.get("locale") ?? "en");

  if (!brandName || !email || password.length < 8) {
    return { error: "invalidInput" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "emailTaken" };
  }

  const baseSlug = slugify(brandName) || "vendor";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.vendorProfile.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: brandName,
      email,
      passwordHash,
      role: "VENDOR",
      vendorProfile: {
        create: { brandName, slug, currency, status: "ACTIVE" },
      },
    },
  });

  revalidatePath("/admin/vendors");
  redirect({ href: "/admin/vendors", locale });
}

export async function updateVendor(vendorId: string, formData: FormData) {
  await requireAdmin();

  await prisma.vendorProfile.update({
    where: { id: vendorId },
    data: {
      brandName: String(formData.get("brandName") ?? ""),
      tagline: String(formData.get("tagline") ?? "") || null,
      bio: String(formData.get("bio") ?? "") || null,
      contactEmail: String(formData.get("contactEmail") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      hqAddress: String(formData.get("hqAddress") ?? "") || null,
      currency: String(formData.get("currency") ?? "USD"),
    },
  });

  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorId}/edit`);
}

export async function deleteVendor(vendorId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId }, select: { userId: true } });
  if (!vendor) return { ok: false, error: "notFound" };

  try {
    await prisma.user.delete({ where: { id: vendor.userId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      return { ok: false, error: "hasOrders" };
    }
    throw error;
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

// ---- Customers ----

export async function createCustomer(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (!name || !email || password.length < 8) {
    return { error: "invalidInput" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "emailTaken" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CUSTOMER",
      customerProfile: {
        create: {
          phone: String(formData.get("phone") ?? "") || null,
          location: String(formData.get("location") ?? "") || null,
          vipTier: (String(formData.get("vipTier") ?? "STANDARD") as "STANDARD" | "ELITE" | "VIP"),
        },
      },
    },
  });

  revalidatePath("/admin/customers");
  redirect({ href: "/admin/customers", locale });
}

export async function updateCustomer(userId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const vipTier = String(formData.get("vipTier") ?? "STANDARD") as "STANDARD" | "ELITE" | "VIP";
  const phone = String(formData.get("phone") ?? "") || null;
  const location = String(formData.get("location") ?? "") || null;

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name } }),
    prisma.customerProfile.upsert({
      where: { userId },
      update: { vipTier, phone, location },
      create: { userId, vipTier, phone, location },
    }),
  ]);

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}/edit`);
}

export async function deleteCustomer(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      return { ok: false, error: "hasOrders" };
    }
    throw error;
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

// ---- Orders ----

export async function updateOrderStatusAdmin(orderId: string, formData: FormData) {
  await requireAdmin();

  const status = String(formData.get("status") ?? "") as OrderStatus;
  const note = String(formData.get("note") ?? "");

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderHistoryEvent.create({ data: { orderId, status, note: note || undefined } }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
}

export async function deleteOrder(orderId: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
