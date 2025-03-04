import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@workspace/db"

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

    const organisationId = user.organisations[0].id;

    const purchaseOrderCount = await prisma.purchaseOrder.count({
      where: { organisationId }
    })

    const invoiceCount = await prisma.invoice.count({
      where: { organisationId }
    })

    return NextResponse.json({ purchaseOrderCount, invoiceCount })
  } catch (error) {
    console.error("[DASHBOARD_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 