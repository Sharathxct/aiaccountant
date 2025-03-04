"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Plus } from "lucide-react"

import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"

interface PurchaseOrder {
  id: string
  date: string
  product: string
  quantity: number
  price: number
  vendor: string
  poNumber: string
  termsOfDelivery: string
  termsOfPayment: string
  createdAt: string
  updatedAt: string
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const res = await fetch("/api/purchase-orders", {
          method: "GET",
          credentials: "include",
        })
        const data = await res.json()
        setPurchaseOrders(data)
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error)
      }
    }

    fetchPurchaseOrders()
  }, [])

  const columns = [
    {
      header: "PO Number",
      accessorKey: "poNumber",
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      header: "Product",
      accessorKey: "product",
    },
    {
      header: "Vendor",
      accessorKey: "vendor",
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (value: number) => `$${value.toFixed(2)}`,
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your purchase orders
          </p>
        </div>
      </div>
      <DataTable
        title="Purchase Orders"
        data={purchaseOrders}
        columns={columns}
      />
    </div>
  )
} 
