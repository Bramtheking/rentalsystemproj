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
  Building2,
  Home,
  Wrench,
  AlertTriangle,
  CalendarIcon,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { unitsApi, damageReportsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Unit {
  id: number
  unit_id: string
  name: string
  unit_type: string
  status: string
  rent: number
  deposit?: number
  location: string
  features: string
  notes: string
  tenant_name: string
  tenant_phone: string
  tenant_email: string
  created_at: string
  updated_at: string
}

interface DamageReport {
  id: number
  damage_id: string
  unit: number
  unit_name: string
  unit_id: string
  damage_type: string
  description: string
  priority: string
  status: string
  reported_by: string
  report_date: string
  repair_details: string
  repair_cost?: number
  repair_date?: string
  contractor_name: string
  contractor_phone: string
  created_at: string
  updated_at: string
}

interface UnitStats {
  total_units: number
  occupied_units: number
  vacant_units: number
  maintenance_units: number
}

interface DamageStats {
  total_reports: number
  pending_reports: number
  in_progress_reports: number
  repaired_reports: number
  unrepaired_reports: number
}

export default function UnitsPage() {
  const { toast } = useToast()

  // State for units
  const [units, setUnits] = useState<Unit[]>([])
  const [unitStats, setUnitStats] = useState<UnitStats>({
    total_units: 0,
    occupied_units: 0,
    vacant_units: 0,
    maintenance_units: 0,
  })
  const [unitsLoading, setUnitsLoading] = useState(true)

  // State for damage reports
  const [damageReports, setDamageReports] = useState<DamageReport[]>([])
  const [damageStats, setDamageStats] = useState<DamageStats>({
    total_reports: 0,
    pending_reports: 0,
    in_progress_reports: 0,
    repaired_reports: 0,
  })
  const [damageLoading, setDamageLoading] = useState(true)
  const [userUnits, setUserUnits] = useState<{ id: number; unit_id: string; name: string }[]>([])

  // UI state
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("Total Units")
  const [damageFilter, setDamageFilter] = useState("All")
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)
  const [isReportDamageOpen, setIsReportDamageOpen] = useState(false)
  const [isRecordRepairOpen, setIsRecordRepairOpen] = useState(false)
  const [reportDate, setReportDate] = useState<Date>()
  const [repairDate, setRepairDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [unitForm, setUnitForm] = useState({
    unit_id: "",
    name: "",
    unit_type: "",
    status: "Vacant",
    rent: "",
    deposit: "",
    location: "",
    features: "",
    notes: "",
    tenant_name: "",
    tenant_phone: "",
    tenant_email: "",
  })

  const [damageForm, setDamageForm] = useState({
    unit: "",
    damage_type: "",
    description: "",
    priority: "",
    reported_by: "",
  })

  const [repairForm, setRepairForm] = useState({
    damageId: "",
    repair_details: "",
    repair_cost: "",
    repair_date: "",
    contractor_name: "",
    contractor_phone: "",
    status: "Repaired",
  })

  // Load data on component mount
  useEffect(() => {
    loadUnits()
    loadDamageReports()
    loadUserUnits()
  }, [])

  const loadUnits = async () => {
    try {
      setUnitsLoading(true)
      const [unitsData, statsData] = await Promise.all([unitsApi.getUnits(), unitsApi.getUnitStats()])
      setUnits(unitsData)
      setUnitStats(statsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load units",
        variant: "destructive",
      })
    } finally {
      setUnitsLoading(false)
    }
  }

  const loadDamageReports = async () => {
    try {
      setDamageLoading(true)
      const [reportsData, statsData] = await Promise.all([
        damageReportsApi.getDamageReports(),
        damageReportsApi.getDamageStats(),
      ])
      setDamageReports(reportsData)
      setDamageStats(statsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load damage reports",
        variant: "destructive",
      })
    } finally {
      setDamageLoading(false)
    }
  }

  const loadUserUnits = async () => {
    try {
      const units = await damageReportsApi.getUserUnits()
      setUserUnits(units)
    } catch (error: any) {
      console.error("Failed to load user units:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const unitFilterButtons = [
    { label: "Total Units", count: unitStats.total_units, icon: Building2 },
    { label: "Occupied Units", count: unitStats.occupied_units, icon: Home },
    { label: "Vacant Units", count: unitStats.vacant_units, icon: Building2 },
    { label: "Under Maintenance", count: unitStats.maintenance_units, icon: Wrench },
  ]

  const damageFilterButtons = [
    { label: "All", count: damageStats.total_reports },
    { label: "Pending", count: damageStats.pending_reports },
    { label: "In Progress", count: damageStats.in_progress_reports },
    { label: "Repaired", count: damageStats.repaired_reports },
    { label: "Unrepaired", count: damageStats.unrepaired_reports },
  ]

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.unit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.tenant_name && unit.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterStatus === "Total Units" ||
      (filterStatus === "Occupied Units" && unit.status === "Occupied") ||
      (filterStatus === "Vacant Units" && unit.status === "Vacant") ||
      (filterStatus === "Under Maintenance" && unit.status === "Under Maintenance")

    return matchesSearch && matchesFilter
  })

  const filteredDamageReports = damageReports.filter((damage) => {
    return (
      damageFilter === "All" ||
      (damageFilter === "Pending" && damage.status === "Pending") ||
      (damageFilter === "In Progress" && damage.status === "In Progress") ||
      (damageFilter === "Repaired" && damage.status === "Repaired") ||
      (damageFilter === "Unrepaired" && damage.status !== "Repaired")
    )
  })

  const handleAddUnit = async () => {
    try {
      setIsSubmitting(true)
      console.log("Starting unit creation with form data:", unitForm) // Debug log

      const unitData = {
        ...unitForm,
        rent: Number.parseFloat(unitForm.rent) || 0,
        deposit: unitForm.deposit ? Number.parseFloat(unitForm.deposit) : null,
      }

      console.log("Processed unit data:", unitData) // Debug log

      const result = await unitsApi.createUnit(unitData)
      console.log("Unit creation result:", result) // Debug log

      toast({
        title: "Success",
        description: "Unit added successfully",
      })

      setIsAddUnitOpen(false)
      resetUnitForm()

      // Reload both units and stats
      await loadUnits()

      // Also reload user units for damage reports
      await loadUserUnits()
    } catch (error: any) {
      console.error("Unit creation error:", error) // Debug log
      toast({
        title: "Error",
        description: error.message || "Failed to add unit. Please check the console for details.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReportDamage = async () => {
    try {
      setIsSubmitting(true)

      const damageData = {
        ...damageForm,
        unit: Number.parseInt(damageForm.unit),
        report_date: reportDate ? format(reportDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      }

      await damageReportsApi.createDamageReport(damageData)

      toast({
        title: "Success",
        description: "Damage report created successfully",
      })

      setIsReportDamageOpen(false)
      resetDamageForm()
      loadDamageReports() // Reload damage reports
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to report damage",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecordRepair = async () => {
    try {
      setIsSubmitting(true)

      const repairData = {
        repair_details: repairForm.repair_details,
        repair_cost: repairForm.repair_cost ? Number.parseFloat(repairForm.repair_cost) : null,
        repair_date: repairDate ? format(repairDate, "yyyy-MM-dd") : null,
        contractor_name: repairForm.contractor_name,
        contractor_phone: repairForm.contractor_phone,
        status: repairForm.status,
      }

      await damageReportsApi.recordRepair(Number.parseInt(repairForm.damageId), repairData)

      toast({
        title: "Success",
        description: "Repair recorded successfully",
      })

      setIsRecordRepairOpen(false)
      resetRepairForm()
      loadDamageReports() // Reload damage reports
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record repair",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUnit = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return

    try {
      await unitsApi.deleteUnit(id)
      toast({
        title: "Success",
        description: "Unit deleted successfully",
      })
      loadUnits() // Reload units
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete unit",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDamageReport = async (id: number) => {
    if (!confirm("Are you sure you want to delete this damage report?")) return

    try {
      await damageReportsApi.deleteDamageReport(id)
      toast({
        title: "Success",
        description: "Damage report deleted successfully",
      })
      loadDamageReports() // Reload damage reports
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete damage report",
        variant: "destructive",
      })
    }
  }

  const resetUnitForm = () => {
    setUnitForm({
      unit_id: "",
      name: "",
      unit_type: "",
      status: "Vacant",
      rent: "",
      deposit: "",
      location: "",
      features: "",
      notes: "",
      tenant_name: "",
      tenant_phone: "",
      tenant_email: "",
    })
  }

  const resetDamageForm = () => {
    setDamageForm({
      unit: "",
      damage_type: "",
      description: "",
      priority: "",
      reported_by: "",
    })
    setReportDate(undefined)
  }

  const resetRepairForm = () => {
    setRepairForm({
      damageId: "",
      repair_details: "",
      repair_cost: "",
      repair_date: "",
      contractor_name: "",
      contractor_phone: "",
      status: "Repaired",
    })
    setRepairDate(undefined)
  }

  // Add these handler functions before the return statement
  const handleViewUnit = (unit: Unit) => {
    // For now, just show unit details in console
    console.log("Viewing unit:", unit)
    toast({
      title: "Unit Details",
      description: `${unit.unit_id} - ${unit.name} (${unit.unit_type})`,
    })
  }

  const handleEditUnit = (unit: Unit) => {
    // For now, just show edit message
    console.log("Editing unit:", unit)
    toast({
      title: "Edit Unit",
      description: "Edit functionality coming soon",
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unit Management</h1>
            <p className="text-gray-600">Manage property units and damage control</p>
          </div>
        </div>

        <Tabs defaultValue="units" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="damage-control">Damage Control</TabsTrigger>
          </TabsList>

          {/* Units Tab */}
          <TabsContent value="units" className="space-y-6">
            {/* Filter Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {unitFilterButtons.map((filter) => (
                <Button
                  key={filter.label}
                  variant={filterStatus === filter.label ? "default" : "outline"}
                  className={cn(
                    "h-auto p-4 flex flex-col items-center space-y-2",
                    filterStatus === filter.label && "bg-blue-600 hover:bg-blue-700",
                  )}
                  onClick={() => setFilterStatus(filter.label)}
                  disabled={unitsLoading}
                >
                  <filter.icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {unitsLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : filter.count}
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
                    <CardTitle>Units List</CardTitle>
                    <CardDescription>Manage all your property units</CardDescription>
                  </div>
                  <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Unit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Unit</DialogTitle>
                        <DialogDescription>Create a new property unit</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                          <Label htmlFor="unit_id">Unit ID *</Label>
                          <Input
                            id="unit_id"
                            placeholder="e.g., A-101"
                            value={unitForm.unit_id}
                            onChange={(e) => setUnitForm({ ...unitForm, unit_id: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Unit Name *</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Apartment A-101"
                            value={unitForm.name}
                            onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unit_type">Unit Type *</Label>
                          <Select
                            value={unitForm.unit_type}
                            onValueChange={(value) => setUnitForm({ ...unitForm, unit_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                              <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                              <SelectItem value="3-bedroom">3 Bedroom</SelectItem>
                              <SelectItem value="4-bedroom">4 Bedroom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={unitForm.status}
                            onValueChange={(value) => setUnitForm({ ...unitForm, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vacant">Vacant</SelectItem>
                              <SelectItem value="Occupied">Occupied</SelectItem>
                              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rent">Monthly Rent (KES) *</Label>
                            <Input
                              id="rent"
                              type="number"
                              placeholder="Rent amount"
                              value={unitForm.rent}
                              onChange={(e) => setUnitForm({ ...unitForm, rent: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deposit">Deposit (KES)</Label>
                            <Input
                              id="deposit"
                              type="number"
                              placeholder="Deposit amount"
                              value={unitForm.deposit}
                              onChange={(e) => setUnitForm({ ...unitForm, deposit: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location/Property Details</Label>
                          <Input
                            id="location"
                            placeholder="e.g., Block A, Floor 1"
                            value={unitForm.location}
                            onChange={(e) => setUnitForm({ ...unitForm, location: e.target.value })}
                          />
                        </div>

                        {unitForm.status === "Occupied" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="tenant_name">Tenant Name</Label>
                              <Input
                                id="tenant_name"
                                placeholder="Tenant full name"
                                value={unitForm.tenant_name}
                                onChange={(e) => setUnitForm({ ...unitForm, tenant_name: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="tenant_phone">Tenant Phone</Label>
                                <Input
                                  id="tenant_phone"
                                  placeholder="Phone number"
                                  value={unitForm.tenant_phone}
                                  onChange={(e) => setUnitForm({ ...unitForm, tenant_phone: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="tenant_email">Tenant Email</Label>
                                <Input
                                  id="tenant_email"
                                  type="email"
                                  placeholder="Email address"
                                  value={unitForm.tenant_email}
                                  onChange={(e) => setUnitForm({ ...unitForm, tenant_email: e.target.value })}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="features">Unit Features/Amenities</Label>
                          <Textarea
                            id="features"
                            placeholder="e.g., Balcony, Parking, WiFi included..."
                            value={unitForm.features}
                            onChange={(e) => setUnitForm({ ...unitForm, features: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional information..."
                            value={unitForm.notes}
                            onChange={(e) => setUnitForm({ ...unitForm, notes: e.target.value })}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            onClick={handleAddUnit}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={
                              isSubmitting ||
                              !unitForm.unit_id ||
                              !unitForm.name ||
                              !unitForm.unit_type ||
                              !unitForm.rent
                            }
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add Unit"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddUnitOpen(false)}
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
                      placeholder="Search units..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Units Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit ID</TableHead>
                        <TableHead>Unit Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unitsLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="mt-2 text-sm text-gray-500">Loading units...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-sm text-gray-500">No units found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.unit_id}</TableCell>
                            <TableCell>{unit.name}</TableCell>
                            <TableCell className="capitalize">{unit.unit_type.replace("-", " ")}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  unit.status === "Occupied"
                                    ? "bg-green-100 text-green-800"
                                    : unit.status === "Vacant"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {unit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(unit.rent)}</TableCell>
                            <TableCell>{unit.tenant_name || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleViewUnit(unit)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditUnit(unit)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteUnit(unit.id)}
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

          {/* Damage Control Tab */}
          <TabsContent value="damage-control" className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {damageFilterButtons.map((filter) => (
                <Button
                  key={filter.label}
                  variant={damageFilter === filter.label ? "default" : "outline"}
                  className={cn("h-auto px-4 py-2", damageFilter === filter.label && "bg-blue-600 hover:bg-blue-700")}
                  onClick={() => setDamageFilter(filter.label)}
                  disabled={damageLoading}
                >
                  {filter.label} ({damageLoading ? "..." : filter.count})
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Damage Control</CardTitle>
                    <CardDescription>Track and manage property damage reports</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={isReportDamageOpen} onOpenChange={setIsReportDamageOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Report Damage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report Damage</DialogTitle>
                          <DialogDescription>Report a new damage incident</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Unit *</Label>
                            <Select
                              value={damageForm.unit}
                              onValueChange={(value) => setDamageForm({ ...damageForm, unit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {userUnits.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id.toString()}>
                                    {unit.unit_id} - {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Damage Type *</Label>
                            <Select
                              value={damageForm.damage_type}
                              onValueChange={(value) => setDamageForm({ ...damageForm, damage_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select damage type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="plumbing">Plumbing</SelectItem>
                                <SelectItem value="electrical">Electrical</SelectItem>
                                <SelectItem value="structural">Structural</SelectItem>
                                <SelectItem value="appliance">Appliance</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                              placeholder="Describe the damage in detail..."
                              value={damageForm.description}
                              onChange={(e) => setDamageForm({ ...damageForm, description: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Priority Level *</Label>
                            <Select
                              value={damageForm.priority}
                              onValueChange={(value) => setDamageForm({ ...damageForm, priority: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Reported By *</Label>
                            <Input
                              placeholder="Name of person reporting"
                              value={damageForm.reported_by}
                              onChange={(e) => setDamageForm({ ...damageForm, reported_by: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Report Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !reportDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {reportDate ? format(reportDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={reportDate} onSelect={setReportDate} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button
                              onClick={handleReportDamage}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                              disabled={
                                isSubmitting ||
                                !damageForm.unit ||
                                !damageForm.damage_type ||
                                !damageForm.description ||
                                !damageForm.priority ||
                                !damageForm.reported_by
                              }
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Reporting
                                </>
                              ) : (
                                "Report Damage"
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsReportDamageOpen(false)}
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
                </div>
              </CardHeader>
              <CardContent>
                {/* Damage Reports Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Damage ID</TableHead>
                        <TableHead>Unit Name</TableHead>
                        <TableHead>Damage Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Report Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {damageLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="mt-2 text-sm text-gray-500">Loading damage reports...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredDamageReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <p className="text-sm text-gray-500">No damage reports found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDamageReports.map((damage) => (
                          <TableRow key={damage.id}>
                            <TableCell className="font-medium">{damage.damage_id}</TableCell>
                            <TableCell>{damage.unit_name}</TableCell>
                            <TableCell className="capitalize">{damage.damage_type}</TableCell>
                            <TableCell className="capitalize">{damage.priority}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  damage.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : damage.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                }
                              >
                                {damage.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{damage.reported_by}</TableCell>
                            <TableCell>{format(new Date(damage.report_date), "PPP")}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => console.log("Viewing damage report:", damage)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => console.log("Editing damage report:", damage)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteDamageReport(damage.id)}
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
        </Tabs>
      </div>
    </MainLayout>
  )
}
