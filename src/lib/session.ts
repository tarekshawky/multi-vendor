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
