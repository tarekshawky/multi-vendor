import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ROLE_GATED_PREFIXES: { segment: string; role: string }[] = [
  { segment: "vendor", role: "VENDOR" },
  { segment: "admin", role: "ADMIN" },
  { segment: "writer", role: "WRITER" },
];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  for (const { segment, role } of ROLE_GATED_PREFIXES) {
    const match = pathname.match(new RegExp(`^/(en|ar)/${segment}(/|$)`));
    if (match) {
      const locale = match[1];
      if (!req.auth || req.auth.user?.role !== role) {
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
      }
      break;
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
