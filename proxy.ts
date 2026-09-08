import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/Intermediarios") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/intermediarios";
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Intermediarios"],
};
