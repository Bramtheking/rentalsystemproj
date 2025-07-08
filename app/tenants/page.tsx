"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
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
  Home,
  CalendarIcon,
  Eye,
  Edit,
  Trash2,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { tenantsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Tenant {
  id: number
  tenant_id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  national_id: string
  date_of_birth?: string
  gender: string
  permanent_address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  occupation: string
  employer_name: string
  employer_phone: string
  monthly_income?: number
  current_unit?: number
  current_unit_name?: string
  current_unit_id?: string
  status: string
  move_in_date?: string
  move_out_date?: string
  lease_start_date?: string
  lease_end_date?: string
  security_deposit?: number
  monthly_rent?: number
  notes: string
  created_at: string
  updated_at: string
}

interface TenantStats {
  total_tenants: number
  active_tenants: number
  inactive_tenants: number
  moved_out_tenants: number
}

interface AvailableUnit {
  id: number
  unit_id: string
  name: string
  rent: number
}

export default function TenantsPage() {
  const { toast } = useToast()

  // State for tenants
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantStats, setTenantStats] = useState<TenantStats>({
    total_tenants: 0,
    active_tenants: 0,
    inactive_tenants: 0,
    moved_out_tenants: 0,
  })
  const [tenantsLoading, setTenantsLoading] = useState(true)
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([])

  // UI state
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false)
  const [isMoveInOpen, setIsMoveInOpen] = useState(false)
  const [isMoveOutOpen, setIsMoveOutOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Date states
  const [dateOfBirth, setDateOfBirth] = useState<Date>()
  const [moveInDate, setMoveInDate] = useState<Date>()
  const [leaseStartDate, setLeaseStartDate] = useState<Date>()
  const [leaseEndDate, setLeaseEndDate] = useState<Date>()
  const [moveOutDate, setMoveOutDate] = useState<Date>()

  // Form state
  const [tenantForm, setTenantForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    national_id: "",
    gender: "",
    permanent_address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    occupation: "",
    employer_name: "",
    employer_phone: "",
    monthly_income: "",
    current_unit: "",
    status: "Active",
    security_deposit: "",
    monthly_rent: "",
    notes: "",
  })

  const [moveInForm, setMoveInForm] = useState({
    unit: "",
    monthly_rent: "",
    security_deposit: "",
  })

  const [moveOutForm, setMoveOutForm] = useState({
    move_out_reason: "",
  })

  // Load data on component mount
  useEffect(() => {
    loadTenants()
    loadAvailableUnits()
  }, [])

  const loadTenants = async () => {
    try {
      setTenantsLoading(true)
      const [tenantsData, statsData] = await Promise.all([tenantsApi.getTenants(), tenantsApi.getTenantStats()])
      setTenants(tenantsData)
      setTenantStats(statsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load tenants",
        variant: "destructive",
      })
    } finally {
      setTenantsLoading(false)
    }
  }

  const loadAvailableUnits = async () => {
    try {
      const units = await tenantsApi.getAvailableUnits()
      setAvailableUnits(units)
    } catch (error: any) {
      console.error("Failed to load available units:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const tenantFilterButtons = [
    { label: "All", count: tenantStats.total_tenants, icon: Users },
    { label: "Active", count: tenantStats.active_tenants, icon: UserCheck },
    { label: "Inactive", count: tenantStats.inactive_tenants, icon: UserX },
    { label: "Moved Out", count: tenantStats.moved_out_tenants, icon: Home },
  ]

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.current_unit_id && tenant.current_unit_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = filterStatus === "All" || tenant.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const handleAddTenant = async () => {
    try {
      setIsSubmitting(true)

      const tenantData = {
        ...tenantForm,
        date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
        move_in_date: moveInDate ? format(moveInDate, "yyyy-MM-dd") : null,
        lease_start_date: leaseStartDate ? format(leaseStartDate, "yyyy-MM-dd") : null,
        lease_end_date: leaseEndDate ? format(leaseEndDate, "yyyy-MM-dd") : null,
        monthly_income: tenantForm.monthly_income ? Number.parseFloat(tenantForm.monthly_income) : null,
        security_deposit: tenantForm.security_deposit ? Number.parseFloat(tenantForm.security_deposit) : null,
        monthly_rent: tenantForm.monthly_rent ? Number.parseFloat(tenantForm.monthly_rent) : null,
        current_unit: tenantForm.current_unit ? Number.parseInt(tenantForm.current_unit) : null,
      }

      await tenantsApi.createTenant(tenantData)

      toast({
        title: "Success",
        description: "Tenant added successfully",
      })

      setIsAddTenantOpen(false)
      resetTenantForm()
      loadTenants()
      loadAvailableUnits()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add tenant",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoveIn = async () => {
    if (!selectedTenant) return

    try {
      setIsSubmitting(true)

      const moveInData = {
        unit: Number.parseInt(moveInForm.unit),
        move_date: moveInDate ? format(moveInDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        monthly_rent: moveInForm.monthly_rent ? Number.parseFloat(moveInForm.monthly_rent) : undefined,
        security_deposit: moveInForm.security_deposit ? Number.parseFloat(moveInForm.security_deposit) : undefined,
        lease_start_date: leaseStartDate ? format(leaseStartDate, "yyyy-MM-dd") : undefined,
        lease_end_date: leaseEndDate ? format(leaseEndDate, "yyyy-MM-dd") : undefined,
      }

      await tenantsApi.moveIn(selectedTenant.id, moveInData)

      toast({
        title: "Success",
        description: "Tenant moved in successfully",
      })

      setIsMoveInOpen(false)
      resetMoveInForm()
      loadTenants()
      loadAvailableUnits()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move tenant in",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoveOut = async () => {
    if (!selectedTenant) return

    try {
      setIsSubmitting(true)

      const moveOutData = {
        move_date: moveOutDate ? format(moveOutDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        move_out_reason: moveOutForm.move_out_reason,
      }

      await tenantsApi.moveOut(selectedTenant.id, moveOutData)

      toast({
        title: "Success",
        description: "Tenant moved out successfully",
      })

      setIsMoveOutOpen(false)
      resetMoveOutForm()
      loadTenants()
      loadAvailableUnits()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move tenant out",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTenant = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return

    try {
      await tenantsApi.deleteTenant(id)
      toast({
        title: "Success",
        description: "Tenant deleted successfully",
      })
      loadTenants()
      loadAvailableUnits()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tenant",
        variant: "destructive",
      })
    }
  }

  const resetTenantForm = () => {
    setTenantForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      national_id: "",
      gender: "",
      permanent_address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      occupation: "",
      employer_name: "",
      employer_phone: "",
      monthly_income: "",
      current_unit: "",
      status: "Active",
      security_deposit: "",
      monthly_rent: "",
      notes: "",
    })
    setDateOfBirth(undefined)
    setMoveInDate(undefined)
    setLeaseStartDate(undefined)
    setLeaseEndDate(undefined)
  }

  const resetMoveInForm = () => {
    setMoveInForm({
      unit: "",
      monthly_rent: "",
      security_deposit: "",
    })
    setMoveInDate(undefined)
    setLeaseStartDate(undefined)
    setLeaseEndDate(undefined)
  }

  const resetMoveOutForm = () => {
    setMoveOutForm({
      move_out_reason: "",
    })
    setMoveOutDate(undefined)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600">Manage tenants and their lease information</p>
          </div>
        </div>

        <Tabs defaultValue="tenants" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="history">Move History</TabsTrigger>
          </TabsList>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            {/* Filter Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tenantFilterButtons.map((filter) => (
                <Button
                  key={filter.label}
                  variant={filterStatus === filter.label ? "default" : "outline"}
                  className={cn(
                    "h-auto p-4 flex flex-col items-center space-y-2",
                    filterStatus === filter.label && "bg-blue-600 hover:bg-blue-700",
                  )}
                  onClick={() => setFilterStatus(filter.label)}
                  disabled={tenantsLoading}
                >
                  <filter.icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {tenantsLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : filter.count}
                    </div>
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
                    <CardDescription>Manage all your tenants</CardDescription>
                  </div>
                  <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tenant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Tenant</DialogTitle>
                        <DialogDescription>Create a new tenant record</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                              id="first_name"
                              placeholder="First name"
                              value={tenantForm.first_name}
                              onChange={(e) => setTenantForm({ ...tenantForm, first_name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                              id="last_name"
                              placeholder="Last name"
                              value={tenantForm.last_name}
                              onChange={(e) => setTenantForm({ ...tenantForm, last_name: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email address"
                              value={tenantForm.email}
                              onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              placeholder="Phone number"
                              value={tenantForm.phone}
                              onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="national_id">National ID</Label>
                            <Input
                              id="national_id"
                              placeholder="National ID number"
                              value={tenantForm.national_id}
                              onChange={(e) => setTenantForm({ ...tenantForm, national_id: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                              value={tenantForm.gender}
                              onValueChange={(value) => setTenantForm({ ...tenantForm, gender: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Date of Birth</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dateOfBirth && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="permanent_address">Permanent Address</Label>
                          <Textarea
                            id="permanent_address"
                            placeholder="Permanent address"
                            value={tenantForm.permanent_address}
                            onChange={(e) => setTenantForm({ ...tenantForm, permanent_address: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                            <Input
                              id="emergency_contact_name"
                              placeholder="Emergency contact name"
                              value={tenantForm.emergency_contact_name}
                              onChange={(e) => setTenantForm({ ...tenantForm, emergency_contact_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                            <Input
                              id="emergency_contact_phone"
                              placeholder="Emergency contact phone"
                              value={tenantForm.emergency_contact_phone}
                              onChange={(e) =>
                                setTenantForm({ ...tenantForm, emergency_contact_phone: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergency_contact_relationship">Emergency Contact Relationship</Label>
                          <Input
                            id="emergency_contact_relationship"
                            placeholder="Relationship (e.g., Parent, Sibling)"
                            value={tenantForm.emergency_contact_relationship}
                            onChange={(e) =>
                              setTenantForm({ ...tenantForm, emergency_contact_relationship: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input
                              id="occupation"
                              placeholder="Job title/occupation"
                              value={tenantForm.occupation}
                              onChange={(e) => setTenantForm({ ...tenantForm, occupation: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monthly_income">Monthly Income (KES)</Label>
                            <Input
                              id="monthly_income"
                              type="number"
                              placeholder="Monthly income"
                              value={tenantForm.monthly_income}
                              onChange={(e) => setTenantForm({ ...tenantForm, monthly_income: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="current_unit">Assign to Unit (Optional)</Label>
                          <Select
                            value={tenantForm.current_unit}
                            onValueChange={(value) => setTenantForm({ ...tenantForm, current_unit: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUnits.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                  {unit.unit_id} - {unit.name} ({formatCurrency(unit.rent)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {tenantForm.current_unit && (
                          <>
                            <div className="space-y-2">
                              <Label>Move In Date</Label>
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

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="monthly_rent">Monthly Rent (KES)</Label>
                                <Input
                                  id="monthly_rent"
                                  type="number"
                                  placeholder="Monthly rent"
                                  value={tenantForm.monthly_rent}
                                  onChange={(e) => setTenantForm({ ...tenantForm, monthly_rent: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="security_deposit">Security Deposit (KES)</Label>
                                <Input
                                  id="security_deposit"
                                  type="number"
                                  placeholder="Security deposit"
                                  value={tenantForm.security_deposit}
                                  onChange={(e) => setTenantForm({ ...tenantForm, security_deposit: e.target.value })}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional information..."
                            value={tenantForm.notes}
                            onChange={(e) => setTenantForm({ ...tenantForm, notes: e.target.value })}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            onClick={handleAddTenant}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={
                              isSubmitting ||
                              !tenantForm.first_name ||
                              !tenantForm.last_name ||
                              !tenantForm.email ||
                              !tenantForm.phone
                            }
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add Tenant"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddTenantOpen(false)}
                            className="flex-1"
                            disabled={isSubmitting}
                          >
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
                        <TableHead>Tenant ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Current Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenantsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="mt-2 text-sm text-gray-500">Loading tenants...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredTenants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-sm text-gray-500">No tenants found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTenants.map((tenant) => (
                          <TableRow key={tenant.id}>
                            <TableCell className="font-medium">{tenant.tenant_id}</TableCell>
                            <TableCell>{tenant.full_name}</TableCell>
                            <TableCell>{tenant.email}</TableCell>
                            <TableCell>{tenant.phone}</TableCell>
                            <TableCell>{tenant.current_unit_id || "N/A"}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  tenant.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : tenant.status === "Inactive"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {tenant.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {!tenant.current_unit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => {
                                      setSelectedTenant(tenant)
                                      setIsMoveInOpen(true)
                                    }}
                                  >
                                    <LogIn className="h-4 w-4" />
                                  </Button>
                                )}
                                {tenant.current_unit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700"
                                    onClick={() => {
                                      setSelectedTenant(tenant)
                                      setIsMoveOutOpen(true)
                                    }}
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteTenant(tenant.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Move History</CardTitle>
                <CardDescription>Track tenant move-in and move-out history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Move history feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Move In Dialog */}
        <Dialog open={isMoveInOpen} onOpenChange={setIsMoveInOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move In Tenant</DialogTitle>
              <DialogDescription>Move {selectedTenant?.full_name} into a unit</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select
                  value={moveInForm.unit}
                  onValueChange={(value) => setMoveInForm({ ...moveInForm, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.unit_id} - {unit.name} ({formatCurrency(unit.rent)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Move In Date *</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="move_monthly_rent">Monthly Rent (KES)</Label>
                  <Input
                    id="move_monthly_rent"
                    type="number"
                    placeholder="Monthly rent"
                    value={moveInForm.monthly_rent}
                    onChange={(e) => setMoveInForm({ ...moveInForm, monthly_rent: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="move_security_deposit">Security Deposit (KES)</Label>
                  <Input
                    id="move_security_deposit"
                    type="number"
                    placeholder="Security deposit"
                    value={moveInForm.security_deposit}
                    onChange={(e) => setMoveInForm({ ...moveInForm, security_deposit: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lease Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !leaseStartDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {leaseStartDate ? format(leaseStartDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={leaseStartDate} onSelect={setLeaseStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Lease End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !leaseEndDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {leaseEndDate ? format(leaseEndDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={leaseEndDate} onSelect={setLeaseEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleMoveIn}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting || !moveInForm.unit || !moveInDate}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Moving In...
                    </>
                  ) : (
                    "Move In"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsMoveInOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Move Out Dialog */}
        <Dialog open={isMoveOutOpen} onOpenChange={setIsMoveOutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move Out Tenant</DialogTitle>
              <DialogDescription>
                Move {selectedTenant?.full_name} out of {selectedTenant?.current_unit_id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Move Out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !moveOutDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {moveOutDate ? format(moveOutDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={moveOutDate} onSelect={setMoveOutDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="move_out_reason">Reason for Moving Out</Label>
                <Textarea
                  id="move_out_reason"
                  placeholder="Reason for moving out (optional)"
                  value={moveOutForm.move_out_reason}
                  onChange={(e) => setMoveOutForm({ ...moveOutForm, move_out_reason: e.target.value })}
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleMoveOut}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={isSubmitting || !moveOutDate}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Moving Out...
                    </>
                  ) : (
                    "Move Out"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsMoveOutOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
