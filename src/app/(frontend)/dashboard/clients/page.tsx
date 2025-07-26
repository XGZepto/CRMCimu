import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Phone, Mail, MapPin } from "lucide-react"

export default function ClientsPage() {
  const clients = [
    {
      id: "CLI-001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      status: "Active",
      orders: 5,
      totalSpent: "$2,450"
    },
    {
      id: "CLI-002",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 (555) 234-5678",
      location: "Los Angeles, CA",
      status: "Active",
      orders: 3,
      totalSpent: "$1,800"
    },
    {
      id: "CLI-003",
      name: "Mike Brown",
      email: "mike.brown@email.com",
      phone: "+1 (555) 345-6789",
      location: "Chicago, IL",
      status: "Inactive",
      orders: 1,
      totalSpent: "$650"
    },
    {
      id: "CLI-004",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+1 (555) 456-7890",
      location: "Houston, TX",
      status: "Active",
      orders: 8,
      totalSpent: "$4,200"
    },
    {
      id: "CLI-005",
      name: "David Lee",
      email: "david.lee@email.com",
      phone: "+1 (555) 567-8901",
      location: "Phoenix, AZ",
      status: "Active",
      orders: 2,
      totalSpent: "$1,150"
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your customer database and relationships
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,104</div>
            <p className="text-xs text-muted-foreground">
              88.5% of total clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$845</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>
            A list of all your clients with their contact information and order history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{client.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === "Active" ? "default" : "outline"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{client.orders}</TableCell>
                  <TableCell className="font-medium">{client.totalSpent}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}