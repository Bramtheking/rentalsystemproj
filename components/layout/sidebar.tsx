"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Building2,
  MessageSquare,
  Receipt,
  FileText,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Rent Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "Tenant Management",
    href: "/tenants",
    icon: Users,
  },
  {
    name: "Unit Management",
    href: "/units",
    icon: Building2,
  },
  {
    name: "SMS Communications",
    href: "/sms",
    icon: MessageSquare,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/20 transition-all duration-300 shadow-xl",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RentPro
              </h1>
              <p className="text-xs text-gray-500">Property Management</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0 hover:bg-blue-50 rounded-xl">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700",
                  collapsed && "justify-center",
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
