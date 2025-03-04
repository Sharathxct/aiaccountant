import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@workspace/db" // Adjust the import based on your structure

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organisations: true }
    })

    if (!user || user.organisations.length === 0) {
      return new NextResponse("No organization found", { status: 404 })
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
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("[INVOICES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 