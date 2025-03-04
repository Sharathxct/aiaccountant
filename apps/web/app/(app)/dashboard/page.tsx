"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Define interfaces for Purchase Order and Invoice
interface PurchaseOrder {
  id: string;
  date: string;
  product: string;
  quantity: number;
  price: number;
  vendor: string;
  poNumber: string;
  document: string; // Add document field
}

interface Invoice {
  id: string;
  date: string;
  customerName: string;
  totalAmount: number;
  status: string;
  invoiceNumber: string;
  document: string; // Add document field
}

export default function Page() {
  const router = useRouter()
  const [purchaseOrderCount, setPurchaseOrderCount] = useState(0)
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]) // Specify type
  const [invoices, setInvoices] = useState<Invoice[]>([]) // Specify type

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch user data")
        }

        if (data.user.organisations.length === 0) {
          router.push("/create-org")
          return
        }

        // Fetch counts of purchase orders and invoices
        const fetchCounts = async () => {
          const res = await fetch("/api/dashboard")
          const data = await res.json()
          setPurchaseOrderCount(data.purchaseOrderCount)
          setInvoiceCount(data.invoiceCount)
        }

        // Fetch purchase orders and invoices
        const fetchPurchaseOrders = async () => {
          const res = await fetch("/api/purchase-orders")
          const data = await res.json()
          setPurchaseOrders(data)
        }

        const fetchInvoices = async () => {
          const res = await fetch("/api/invoices")
          const data = await res.json()
          setInvoices(data)
        }

        fetchCounts()
        fetchPurchaseOrders()
        fetchInvoices()

      } catch (error) {
        console.error("Dashboard error:", error)
        router.push("/login")
      }
    }

    checkUser()
  }, [router])

  const handleAddInvoice = () => {
    router.push("/invoices/new") // Adjust the path as necessary for your application
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your purchase orders and invoices
          </p>
        </div>
      </div>
      <div className="grid gap-6">
        <div className="p-4 border rounded-md shadow-md">
          <h2 className="text-xl font-semibold">Total Purchase Orders</h2>
          <p className="text-2xl">{purchaseOrderCount}</p>
          <h3 className="text-lg">Documents:</h3>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">PO Number</th>
                <th className="text-left">Document</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.poNumber}</td>
                  <td>
                    <a href={order.document} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border rounded-md shadow-md">
          <h2 className="text-xl font-semibold">Total Invoices</h2>
          <p className="text-2xl">{invoiceCount}</p>
          <h3 className="text-lg">Documents:</h3>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Invoice Number</th>
                <th className="text-left">Document</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>
                    <a href={invoice.document} target="_blank" rel="noopener noreferrer">
                      View Document
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
