import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "@/i18n/navigation";

export async function requireVendor(locale: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    redirect({ href: "/login", locale });
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!vendor) {
    redirect({ href: "/login", locale });
  }

  return { user: session!.user, vendor: vendor! };
}

export async function requireAdmin(locale: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect({ href: "/login", locale });
  }
  return { user: session!.user };
}

export async function requireWriter(locale: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WRITER") {
    redirect({ href: "/login", locale });
  }
  return { user: session!.user };
}
