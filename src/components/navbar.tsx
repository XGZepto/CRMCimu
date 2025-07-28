"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LayoutDashboard, Users, Package, Scissors, ShirtIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import CimuIcon from "@/components/cimu-icon"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
    description: "Manage customer information"
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: Package,
    description: "Track orders"
  },
  {
    title: "Items",
    href: "/dashboard/items",
    icon: ShirtIcon,
    description: "Manage items and assignments"
  },
  {
    title: "Tailors",
    href: "/dashboard/tailors",
    icon: Scissors,
    description: "Manage tailor assignments"
  }
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-full shadow-md px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-8">
            <CimuIcon className="h-7 w-7" />
            <span className="font-semibold text-lg hidden sm:block">CRM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>
                    Access all sections of your CRM dashboard
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <nav className="flex flex-col space-y-3">
                    {navigationItems.map((item, index) => (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <item.icon className="h-5 w-5" />
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                        {index < navigationItems.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  )
}

