import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Scissors, Plus, Star, Clock, CheckCircle, Phone, Mail } from "lucide-react"

export default function TailorsPage() {
  const tailors = [
    {
      id: "TAI-001",
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      phone: "+1 (555) 123-4567",
      specialization: "Wedding Dresses",
      experience: "8 years",
      status: "Available",
      rating: 4.9,
      activeOrders: 3,
      completedOrders: 156,
      joinDate: "2020-03-15"
    },
    {
      id: "TAI-002",
      name: "Bob Wilson",
      email: "bob.wilson@email.com",
      phone: "+1 (555) 234-5678",
      specialization: "Men's Suits",
      experience: "12 years",
      status: "Busy",
      rating: 4.8,
      activeOrders: 5,
      completedOrders: 287,
      joinDate: "2018-07-22"
    },
    {
      id: "TAI-003",
      name: "Carol Davis",
      email: "carol.davis@email.com",
      phone: "+1 (555) 345-6789",
      specialization: "Casual Wear",
      experience: "5 years",
      status: "Available",
      rating: 4.7,
      activeOrders: 2,
      completedOrders: 98,
      joinDate: "2021-11-08"
    },
    {
      id: "TAI-004",
      name: "David Martinez",
      email: "david.martinez@email.com",
      phone: "+1 (555) 456-7890",
      specialization: "Alterations",
      experience: "15 years",
      status: "On Leave",
      rating: 4.6,
      activeOrders: 0,
      completedOrders: 423,
      joinDate: "2016-01-12"
    },
    {
      id: "TAI-005",
      name: "Eva Thompson",
      email: "eva.thompson@email.com",
      phone: "+1 (555) 567-8901",
      specialization: "Evening Wear",
      experience: "6 years",
      status: "Available",
      rating: 4.9,
      activeOrders: 4,
      completedOrders: 134,
      joinDate: "2019-09-03"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{status}</Badge>
      case "Busy":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />{status}</Badge>
      case "On Leave":
        return <Badge variant="outline">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tailors</h1>
          <p className="text-muted-foreground">
            Manage your team of skilled tailors and their assignments
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Tailor</span>
        </Button>
      </div>

      {/* Tailor Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tailors</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Ready for new orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Working on orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tailors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tailor Directory</CardTitle>
          <CardDescription>
            Manage your tailors, their specializations, and current workload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tailor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tailors.map((tailor) => (
                <TableRow key={tailor.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{tailor.name}</div>
                      <div className="text-sm text-muted-foreground">{tailor.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{tailor.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{tailor.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tailor.specialization}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {tailor.experience}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(tailor.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{tailor.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{tailor.activeOrders} active</div>
                      <div className="text-muted-foreground">{tailor.completedOrders} completed</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                      <Button variant="ghost" size="sm">
                        Assign Order
                      </Button>
                    </div>
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