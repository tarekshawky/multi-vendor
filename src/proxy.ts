import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ROLE_GATED_PREFIXES: { segment: string; role: string }[] = [
  { segment: "vendor", role: "VENDOR" },
  { segment: "admin", role: "ADMIN" },
  { segment: "writer", role: "WRITER" },
];

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  for (const { segment, role } of ROLE_GATED_PREFIXES) {
    const match = pathname.match(new RegExp(`^/(en|ar)/${segment}(/|$)`));
    if (match) {
      const locale = match[1];
      if (!req.auth || req.auth.user?.role !== role) {
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
      }

      // JWT sessions don't re-check the DB on their own, so a suspension
      // applied after this token was issued wouldn't take effect until it
      // expired. Gated areas are exactly where that matters, so verify
      // account status here and force a sign-out if it was revoked.
      const dbUser = await prisma.user.findUnique({
        where: { id: req.auth.user.id },
        select: { status: true },
      });
      if (dbUser?.status === "SUSPENDED") {
        const response = NextResponse.redirect(new URL(`/${locale}/login?error=accountSuspended`, req.url));
        response.cookies.delete("authjs.session-token");
        response.cookies.delete("__Secure-authjs.session-token");
        return response;
      }
      break;
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
