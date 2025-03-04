import { NextResponse } from "next/server";
import { prisma } from "@workspace/db";
import * as bcrypt from "bcryptjs";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode("mysecret");
const alg = "HS256";

export async function POST(req: Request) {
  try {
    const { email, password, name, action } = await req.json();

    if (action === "signup") {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });

      const token = await new jose.SignJWT({ userId: user.id })
        .setProtectedHeader({ alg })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json(
        { success: true, user: { id: user.id, email: user.email, name: user.name } },
        { status: 201 }
      );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    }

    if (action === "login") {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = await new jose.SignJWT({ userId: user.id })
        .setProtectedHeader({ alg })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json(
        { success: true, user: { id: user.id, email: user.email, name: user.name } }
      );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 