"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  CalendarIcon,
  Eye,
  Edit,
  Trash2,
  Home,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Dummy data for tenants
const tenantsData = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+254712345678",
    unit: "A-101",
    moveInDate: "2023-06-15",
    moveOutDate: null,
    status: "Current",
    balance: 0,
    deposit: 25000,
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+254723456789",
    unit: "B-205",
    moveInDate: "2023-08-01",
    moveOutDate: null,
    status: "Arrears",
    balance: -15000,
    deposit: 30000,
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Wilson",
    email: "mike.wilson@email.com",
    phone: "+254734567890",
    unit: "C-301",
    moveInDate: "2023-09-10",
    moveOutDate: null,
    status: "Good Standing",
    balance: 5000,
    deposit: 28000,
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@email.com",
    phone: "+254745678901",
    unit: null,
    moveInDate: "2023-05-20",
    moveOutDate: "2024-01-10",
    status: "Vacated",
    balance: 0,
    deposit: 32000,
  },
]

// Move process data
const moveProcessData = [
  {
    id: 1,
    tenant: "Alice Brown",
    unit: "D-401",
    type: "Move In",
    date: "2024-01-20",
    status: "Pending",
    deposit: 35000,
  },
  {
    id: 2,
    tenant: "Robert Taylor",
    unit: "A-103",
    type: "Move Out",
    date: "2024-01-25",
    status: "In Progress",
    finalBill: 12000,
  },
]

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All Tenants")
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false)
  const [isMoveInOpen, setIsMoveInOpen] = useState(false)
  const [isMoveOutOpen, setIsMoveOutOpen] = useState(false)
  const [moveInDate, setMoveInDate] = useState<Date>()
  const [moveOutDate, setMoveOutDate] = useState<Date>()

  const [tenantForm, setTenantForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    unit: "",
    deposit: "",
    emergencyContact: "",
    emergencyPhone: "",
  })

  const [moveInForm, setMoveInForm] = useState({
    tenant: "",
    unit: "",
    deposit: "",
    agreement: null,
  })

  const [moveOutForm, setMoveOutForm] = useState({
    tenant: "",
    finalBill: "",
    depositReturn: "",
    reason: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filterButtons = [
    { label: "All Tenants", count: tenantsData.length, icon: Users },
    { label: "Tenants with Arrears", count: tenantsData.filter((t) => t.balance < 0).length, icon: AlertTriangle },
    { label: "Current Tenants", count: tenantsData.filter((t) => t.status === "Current").length, icon: UserCheck },
    {
      label: "Good Standing Tenants",
      count: tenantsData.filter((t) => t.status === "Good Standing").length,
      icon: UserCheck,
    },
    { label: "Vacated Tenants", count: tenantsData.filter((t) => t.status === "Vacated").length, icon: UserX },
    { label: "Deposit-defaulters", count: 2, icon: AlertTriangle },
  ]

  const filteredTenants = tenantsData.filter((tenant) => {
    const matchesSearch =
      tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.unit && tenant.unit.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterStatus === "All Tenants" ||
      (filterStatus === "Tenants with Arrears" && tenant.balance < 0) ||
      (filterStatus === "Current Tenants" && tenant.status === "Current") ||
      (filterStatus === "Good Standing Tenants" && tenant.status === "Good Standing") ||
      (filterStatus === "Vacated Tenants" && tenant.status === "Vacated")

    return matchesSearch && matchesFilter
  })

  const handleAddTenant = () => {
    console.log("Adding tenant:", { ...tenantForm, moveInDate })
    setIsAddTenantOpen(false)
    // Reset form
    setTenantForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      unit: "",
      deposit: "",
      emergencyContact: "",
      emergencyPhone: "",
    })
    setMoveInDate(undefined)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600">Manage tenants and move-in/move-out processes</p>
          </div>
        </div>

        <Tabs defaultValue="tenants" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="move-process">Move In/Out Process</TabsTrigger>
          </TabsList>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            {/* Filter Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {filterButtons.map((filter) => (
                <Button
                  key={filter.label}
                  variant={filterStatus === filter.label ? "default" : "outline"}
                  className={cn(
                    "h-auto p-4 flex flex-col items-center space-y-2",
                    filterStatus === filter.label && "bg-blue-600 hover:bg-blue-700",
                  )}
                  onClick={() => setFilterStatus(filter.label)}
                >
                  <filter.icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-lg font-bold">{filter.count}</div>
                    <div className="text-xs">{filter.label}</div>
                  </div>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tenants List</CardTitle>
                    <CardDescription>Manage all your tenants and their information</CardDescription>
                  </div>
                  <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tenant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Tenant</DialogTitle>
                        <DialogDescription>Enter tenant details and assign a unit</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              placeholder="First name"
                              value={tenantForm.firstName}
                              onChange={(e) => setTenantForm({ ...tenantForm, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Last name"
                              value={tenantForm.lastName}
                              onChange={(e) => setTenantForm({ ...tenantForm, lastName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={tenantForm.email}
                            onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            placeholder="Phone number"
                            value={tenantForm.phone}
                            onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unit">Unit Assignment</Label>
                          <Select
                            value={tenantForm.unit}
                            onValueChange={(value) => setTenantForm({ ...tenantForm, unit: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A-101">A-101</SelectItem>
                              <SelectItem value="A-102">A-102</SelectItem>
                              <SelectItem value="B-205">B-205</SelectItem>
                              <SelectItem value="C-301">C-301</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="moveInDate">Move-in Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !moveInDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {moveInDate ? format(moveInDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={moveInDate} onSelect={setMoveInDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deposit">Deposit Amount (KES)</Label>
                          <Input
                            id="deposit"
                            type="number"
                            placeholder="Deposit amount"
                            value={tenantForm.deposit}
                            onChange={(e) => setTenantForm({ ...tenantForm, deposit: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact">Emergency Contact</Label>
                          <Input
                            id="emergencyContact"
                            placeholder="Emergency contact name"
                            value={tenantForm.emergencyContact}
                            onChange={(e) => setTenantForm({ ...tenantForm, emergencyContact: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                          <Input
                            id="emergencyPhone"
                            placeholder="Emergency contact phone"
                            value={tenantForm.emergencyPhone}
                            onChange={(e) => setTenantForm({ ...tenantForm, emergencyPhone: e.target.value })}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button onClick={handleAddTenant} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Add Tenant
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddTenantOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search tenants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Tenants Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Move-in Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">
                            {tenant.firstName} {tenant.lastName}
                          </TableCell>
                          <TableCell>{tenant.email}</TableCell>
                          <TableCell>{tenant.phone}</TableCell>
                          <TableCell>{tenant.unit || "N/A"}</TableCell>
                          <TableCell>{tenant.moveInDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                tenant.status === "Current"
                                  ? "bg-blue-100 text-blue-800"
                                  : tenant.status === "Good Standing"
                                    ? "bg-green-100 text-green-800"
                                    : tenant.status === "Arrears"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }
                            >
                              {tenant.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={tenant.balance < 0 ? "text-red-600" : "text-green-600"}>
                              {formatCurrency(tenant.balance)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Move In/Out Process Tab */}
          <TabsContent value="move-process" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Move In/Out Process</CardTitle>
                    <CardDescription>Manage tenant move-in and move-out processes</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={isMoveInOpen} onOpenChange={setIsMoveInOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Home className="mr-2 h-4 w-4" />
                          Move In
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Move In</DialogTitle>
                          <DialogDescription>Complete tenant move-in process</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Tenant</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tenant" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="alice-brown">Alice Brown</SelectItem>
                                <SelectItem value="david-clark">David Clark</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Unit</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="D-401">D-401</SelectItem>
                                <SelectItem value="E-501">E-501</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Move-in Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  Pick a date
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Deposit Amount (KES)</Label>
                            <Input type="number" placeholder="Enter deposit amount" />
                          </div>
                          <div className="flex space-x-2 pt-4">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700">Process Move In</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsMoveInOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isMoveOutOpen} onOpenChange={setIsMoveOutOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          <LogOut className="mr-2 h-4 w-4" />
                          Move Out
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Move Out</DialogTitle>
                          <DialogDescription>Complete tenant move-out process</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Tenant</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tenant" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="robert-taylor">Robert Taylor</SelectItem>
                                <SelectItem value="lisa-white">Lisa White</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Move-out Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  Pick a date
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Final Bill (KES)</Label>
                            <Input type="number" placeholder="Enter final bill amount" />
                          </div>
                          <div className="space-y-2">
                            <Label>Deposit Return (KES)</Label>
                            <Input type="number" placeholder="Enter deposit return amount" />
                          </div>
                          <div className="flex space-x-2 pt-4">
                            <Button className="flex-1 bg-red-600 hover:bg-red-700">Process Move Out</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsMoveOutOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Move Process Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Process Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {moveProcessData.map((process) => (
                        <TableRow key={process.id}>
                          <TableCell className="font-medium">{process.tenant}</TableCell>
                          <TableCell>{process.unit}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                process.type === "Move In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {process.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{process.date}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                process.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {process.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {process.deposit && formatCurrency(process.deposit)}
                            {process.finalBill && formatCurrency(process.finalBill)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
