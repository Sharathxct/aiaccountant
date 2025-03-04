"use client"

import { AppSidebar as BaseAppSidebar, type AppSidebarProps } from "@workspace/ui/components/app-sidebar"
import { useRouter } from "next/navigation"

export function AppSidebar(props: Omit<AppSidebarProps, 'onLogout'>) {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
    router.refresh()
  }

  return <BaseAppSidebar {...props} onLogout={handleLogout} />
} 