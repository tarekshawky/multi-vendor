"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/navigation";

export type AuthActionState = { error?: string } | undefined;

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const callbackUrl = String(formData.get("callbackUrl") ?? "");

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw error;
  }

  // Only honor same-origin relative paths to avoid an open redirect.
  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    redirect({ href: callbackUrl, locale });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const destinations: Record<string, string> = {
    VENDOR: "/vendor/dashboard",
    ADMIN: "/admin/dashboard",
    WRITER: "/writer/dashboard",
  };
  redirect({ href: destinations[user?.role ?? ""] ?? "/", locale });
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
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
    data: { name, email, passwordHash, role: "CUSTOMER", customerProfile: { create: {} } },
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw error;
  }

  redirect({ href: "/", locale });
}
