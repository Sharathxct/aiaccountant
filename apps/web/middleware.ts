import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@workspace/db";

const JWT_SECRET = "mysecret";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname == "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const token = request.cookies.get("token")?.value;

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { organisations: true }
      });

      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (user.organisations.length === 0 && !request.nextUrl.pathname.startsWith("/create-org")) {
        return NextResponse.redirect(new URL("/create-org", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith("/create-org")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/create-org"]
}; 
