import { NextResponse, type NextRequest } from "next/server";

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "clinicly.app";

/** acme.clinicly.app/ → /book/acme (public booking page on the tenant's subdomain). */
export function proxy(req: NextRequest) {
  const host = req.headers.get("host")?.split(":")[0] ?? "";
  if (host.endsWith(`.${ROOT}`)) {
    const sub = host.slice(0, -(ROOT.length + 1));
    if (sub && sub !== "www" && sub !== "app" && req.nextUrl.pathname === "/") {
      return NextResponse.rewrite(new URL(`/book/${sub}`, req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
