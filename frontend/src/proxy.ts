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
const PUBLIC_PATHS = ["/", "/login", "/forgot-password", "/reset-password", "/activate-account", "/portal/login"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((path) => path !== "/" && (pathname === path || pathname.startsWith(path + "/")));
}

function getRoleFromCookie(cookieValue?: string): string | null {
  if (!cookieValue) return null;
  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const parsed = JSON.parse(json);
    return typeof parsed?.role === "string" ? parsed.role : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get("accessToken")?.value;
  const hasSessionCookie = Boolean(tokenCookie);
  const role = getRoleFromCookie(tokenCookie);

  // Portal routes (/portal, /portal/invoices, /portal/bills) require a CONTACT-role session.
  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    if (!hasSessionCookie || role !== "CONTACT") {
      const loginUrl = new URL("/portal/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (pathname === "/portal") {
      return NextResponse.redirect(new URL("/portal/invoices", request.url));
    }
    return NextResponse.next();
  }

  // All other pages are staff (dashboard) pages requiring an Admin or Accountant session.
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // A Contact session trying to access staff dashboard pages is redirected to their portal.
  if (role === "CONTACT") {
    return NextResponse.redirect(new URL("/portal/invoices", request.url));
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
