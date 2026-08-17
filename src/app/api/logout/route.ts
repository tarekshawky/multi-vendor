import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Auth.js v5 beta's own /api/auth/signout endpoint only sets the
// cookie-clearing header in its traditional-redirect (non-JSON) response
// mode, and in this build that mode never actually reaches the browser's
// cookie jar (verified: 302 status, but no Set-Cookie applied) — so we
// clear the session directly here instead of depending on it.
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
];

export async function POST(request: Request) {
  const cookieStore = await cookies();
  for (const name of SESSION_COOKIE_NAMES) {
    cookieStore.delete(name);
  }

  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") ?? "/");
  return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
}
