import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

  if (request.nextUrl.pathname == "/") {
    console.log("empty route")
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  const token = request.cookies.get("token")?.value;
  console.log("middleware: ", token)

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"]
}; 
