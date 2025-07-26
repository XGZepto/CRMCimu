import { headers as getHeaders } from 'next/headers.js'
import config from '@/payload.config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Package, Scissors, TrendingUp } from "lucide-react"
import { getPayload } from "payload"
import { redirect } from 'next/navigation'
import { HydrateClientUser } from '@/components/utils/HydrateClientUser'

export default async function DashboardPage() {

    const headers = await getHeaders()
    const payload = await getPayload({ config })
    const { permissions, user } = await payload.auth({ headers })

    if (!user) {
        redirect(
            `/login?error=${encodeURIComponent('You must be logged in to access your account.')}&redirect=/dashboard`,
        )
        }

  const stats = [
    {
      title: "Total Clients",
      value: "1,247",
      change: "+12%",
      icon: Users,
      description: "Active customers"
    },
    {
      title: "Inventory Items",
      value: "3,521",
      change: "+3%",
      icon: Package,
      description: "Items in stock"
    },
    {
      title: "Active Tailors",
      value: "18",
      change: "+2",
      icon: Scissors,
      description: "Working tailors"
    },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      change: "+18%",
      icon: TrendingUp,
      description: "This month"
    }
  ]

  const recentOrders = [
    { id: "ORD-001", client: "John Doe", item: "Custom Suit", status: "In Progress", tailor: "Alice Johnson" },
    { id: "ORD-002", client: "Jane Smith", item: "Wedding Dress", status: "Completed", tailor: "Bob Wilson" },
    { id: "ORD-003", client: "Mike Brown", item: "Casual Shirt", status: "Pending", tailor: "Carol Davis" },
    { id: "ORD-004", client: "Sarah Wilson", item: "Formal Dress", status: "In Progress", tailor: "Alice Johnson" },
  ]

  return (
    <div className="space-y-8">
        <HydrateClientUser permissions={permissions as any} user={user} /> 
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Recent Orders</span>
          </CardTitle>
          <CardDescription>
            Latest orders from your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{order.id}</div>
                  <div className="text-sm text-muted-foreground">{order.client}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{order.item}</div>
                  <div className="text-sm text-muted-foreground">by {order.tailor}</div>
                </div>
                <Badge variant={
                  order.status === "Completed" ? "default" :
                  order.status === "In Progress" ? "secondary" : "outline"
                }>
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}