import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode("mysecret");

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname == "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const token = request.cookies.get("token")?.value;

  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/create-org")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await jose.jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.log("error in the middleware", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/create-org"]
}; 
