import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const vendorMatch = pathname.match(/^\/(en|ar)\/vendor(\/|$)/);
  const adminMatch = pathname.match(/^\/(en|ar)\/admin(\/|$)/);

  if (vendorMatch) {
    const locale = vendorMatch[1];
    const role = req.auth?.user?.role;
    if (!req.auth || role !== "VENDOR") {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  if (adminMatch) {
    const locale = adminMatch[1];
    const role = req.auth?.user?.role;
    if (!req.auth || role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
