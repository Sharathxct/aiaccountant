import { NextResponse } from "next/server"
import * as jose from "jose"
import { prisma } from "@workspace/db"

const JWT_SECRET = new TextEncoder().encode("mysecret");

export async function GET(req: Request) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { organisations: true }
    });

    if (!user || !user.organisations || user.organisations.length === 0) {
      return new NextResponse("No organization found", { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        organisationId: user.organisations[0].id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        date: true,
        customerName: true,
        totalAmount: true,
        status: true,
        invoiceNumber: true,
        document: true,
      }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[INVOICES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 