import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages that don't need a login. Everything else is treated as a
// (dashboard) page and requires a session - this "protect by default"
// approach means new dashboard pages are guarded automatically as they're
// added in later branches, without having to remember to update this list
// every time.
//
// "/portal" is included here because Contact-portal login is a separate
// flow (built in feat/contact-master / feat/contact-portal) - guarding
// portal pages specifically for a CONTACT session happens there, not here.
const PUBLIC_PATHS = ["/", "/login", "/forgot-password", "/reset-password", "/activate-account", "/portal"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((path) => path !== "/" && pathname.startsWith(path));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // This only checks that the cookie EXISTS, not that the JWT inside it is
  // still valid - that check needs the JWT secret, which only the backend
  // has. A stale/expired cookie still gets past this middleware, but every
  // actual API call still gets rejected with 401 by the backend, so no
  // real data is ever exposed - this middleware just avoids the flash of
  // a dashboard page before that 401 comes back.
  const hasSessionCookie = request.cookies.has("accessToken");

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every page request except Next.js internals and static files
    // (anything with a file extension, like .png or .css).
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
