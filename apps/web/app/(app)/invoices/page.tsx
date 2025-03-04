"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { DataTable } from "@/components/data-table"

interface Invoice {
  id: string
  date: string
  customerName: string
  totalAmount: number
  status: string
  invoiceNumber: string
  termsOfPayment: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices")
        const data = await res.json()
        setInvoices(data)
      } catch (error) {
        console.error("Failed to fetch invoices:", error)
      }
    }

    fetchInvoices()
  }, [])

  const columns = [
    {
      header: "Invoice Number",
      accessorKey: "invoiceNumber",
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      header: "Customer",
      accessorKey: "customerName",
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      cell: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${value.toLowerCase() === "paid" ? "bg-green-50 text-green-700" :
          value.toLowerCase() === "pending" ? "bg-yellow-50 text-yellow-700" :
            "bg-red-50 text-red-700"
          }`}>
          {value}
        </span>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (value: string) => format(new Date(value), "MMM dd, yyyy"),
    },
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your invoices
          </p>
        </div>
      </div>
      <DataTable
        title="Invoices"
        data={invoices}
        columns={columns}
      />
    </div>
  )
} 
