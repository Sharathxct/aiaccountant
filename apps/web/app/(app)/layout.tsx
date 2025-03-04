"use client"

import { FileText, ShoppingCart } from "lucide-react"

import { NavMain } from "@workspace/ui/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarInset,
} from "@workspace/ui/components/sidebar"

const navItems = [
  {
    title: "Purchase Orders",
    icon: ShoppingCart,
    url: "/purchase-orders",
  },
  {
    title: "Invoices",
    icon: FileText,
    url: "/invoices",
  },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <NavMain items={navItems} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 