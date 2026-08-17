"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ChangePasswordResult = { ok: boolean; error?: string };

export async function changePassword(formData: FormData): Promise<ChangePasswordResult> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { ok: false, error: "passwordTooShort" };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "passwordMismatch" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { ok: false, error: "incorrectPassword" };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "incorrectPassword" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  if (user.role === "VENDOR") {
    await prisma.vendorProfile.updateMany({ where: { userId: user.id }, data: { passwordUpdatedAt: new Date() } });
  }

  return { ok: true };
}
