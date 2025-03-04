import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import { prisma } from "@workspace/db";

const JWT_SECRET = new TextEncoder().encode("mysecret");

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { organisations: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 