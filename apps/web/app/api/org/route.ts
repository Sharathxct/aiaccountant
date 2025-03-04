import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@workspace/db";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = "mysecret";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organisations: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.organisations.length > 0) {
      return NextResponse.json(
        { error: "User already has an organization" },
        { status: 400 }
      );
    }

    const organisation = await prisma.organisation.create({
      data: {
        name,
        adminId: user.id
      }
    });

    return NextResponse.json({ success: true, organisation });
  } catch (error) {
    console.error("Organization creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 