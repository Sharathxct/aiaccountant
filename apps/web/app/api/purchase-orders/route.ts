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

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        organisationId: user.organisations[0].id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        date: true,
        product: true,
        quantity: true,
        price: true,
        vendor: true,
        poNumber: true,
        document: true,
      }
    })

    return NextResponse.json(purchaseOrders)
  } catch (error) {
    console.error("[PURCHASE_ORDERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 