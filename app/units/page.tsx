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
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Dummy data for units
const unitsData = [
  {
    id: 1,
    unitId: "A-101",
    name: "Apartment A-101",
    type: "1 Bedroom",
    status: "Occupied",
    rent: 25000,
    tenant: "John Smith",
    location: "Block A, Floor 1",
  },
  {
    id: 2,
    unitId: "A-102",
    name: "Apartment A-102",
    type: "1 Bedroom",
    status: "Vacant",
    rent: 25000,
    tenant: null,
    location: "Block A, Floor 1",
  },
  {
    id: 3,
    unitId: "B-205",
    name: "Apartment B-205",
    type: "2 Bedroom",
    status: "Occupied",
    rent: 35000,
    tenant: "Sarah Johnson",
    location: "Block B, Floor 2",
  },
  {
    id: 4,
    unitId: "C-301",
    name: "Apartment C-301",
    type: "3 Bedroom",
    status: "Under Maintenance",
    rent: 45000,
    tenant: null,
    location: "Block C, Floor 3",
  },
]

// Dummy data for damage reports
const damageReportsData = [
  {
    id: 1,
    damageId: "DMG-2024-001",
    unit: "A-101",
    description: "Leaking faucet in kitchen",
    reportedBy: "John Smith",
    dateReported: "2024-01-15",
    status: "Pending",
    priority: "Medium",
  },
  {
    id: 2,
    damageId: "DMG-2024-002",
    unit: "B-205",
    description: "Broken window in living room",
    reportedBy: "Sarah Johnson",
    dateReported: "2024-01-14",
    status: "In Progress",
    priority: "High",
  },
  {
    id: 3,
    damageId: "DMG-2024-003",
    unit: "C-301",
    description: "Electrical outlet not working",
    reportedBy: "Property Manager",
    dateReported: "2024-01-13",
    status: "Repaired",
    priority: "Low",
  },
]

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("Total Units")
  const [damageFilter, setDamageFilter] = useState("All")
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)
  const [isReportDamageOpen, setIsReportDamageOpen] = useState(false)
  const [isRecordRepairOpen, setIsRecordRepairOpen] = useState(false)
  const [reportDate, setReportDate] = useState<Date>()
  const [repairDate, setRepairDate] = useState<Date>()

  const [unitForm, setUnitForm] = useState({
    unitId: "",
    name: "",
    type: "",
    rent: "",
    deposit: "",
    location: "",
    features: "",
    notes: "",
  })

  const [damageForm, setDamageForm] = useState({
    unit: "",
    damageType: "",
    description: "",
    priority: "",
    reportedBy: "",
  })

  const [repairForm, setRepairForm] = useState({
    damageId: "",
    repairDetails: "",
    cost: "",
    contractor: "",
    contractorPhone: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const unitFilterButtons = [
    { label: "Total Units", count: unitsData.length, icon: Building2 },
    { label: "Occupied Units", count: unitsData.filter((u) => u.status === "Occupied").length, icon: Home },
    { label: "Vacant Units", count: unitsData.filter((u) => u.status === "Vacant").length, icon: Building2 },
    {
      label: "Under Maintenance",
      count: unitsData.filter((u) => u.status === "Under Maintenance").length,
      icon: Wrench,
    },
  ]

  const damageFilterButtons = [
    { label: "All", count: damageReportsData.length },
    { label: "Pending", count: damageReportsData.filter((d) => d.status === "Pending").length },
    { label: "In Progress", count: damageReportsData.filter((d) => d.status === "In Progress").length },
    { label: "Repaired", count: damageReportsData.filter((d) => d.status === "Repaired").length },
    { label: "Unrepaired", count: damageReportsData.filter((d) => d.status !== "Repaired").length },
  ]

  const filteredUnits = unitsData.filter((unit) => {
    const matchesSearch =
      unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.tenant && unit.tenant.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterStatus === "Total Units" ||
      (filterStatus === "Occupied Units" && unit.status === "Occupied") ||
      (filterStatus === "Vacant Units" && unit.status === "Vacant") ||
      (filterStatus === "Under Maintenance" && unit.status === "Under Maintenance")

    return matchesSearch && matchesFilter
  })

  const filteredDamageReports = damageReportsData.filter((damage) => {
    return (
      damageFilter === "All" ||
      (damageFilter === "Pending" && damage.status === "Pending") ||
      (damageFilter === "In Progress" && damage.status === "In Progress") ||
      (damageFilter === "Repaired" && damage.status === "Repaired") ||
      (damageFilter === "Unrepaired" && damage.status !== "Repaired")
    )
  })

  const handleAddUnit = () => {
    console.log("Adding unit:", unitForm)
    setIsAddUnitOpen(false)
    // Reset form
    setUnitForm({
      unitId: "",
      name: "",
      type: "",
      rent: "",
      deposit: "",
      location: "",
      features: "",
      notes: "",
    })
  }

  const handleReportDamage = () => {
    console.log("Reporting damage:", { ...damageForm, reportDate })
    setIsReportDamageOpen(false)
    // Reset form
    setDamageForm({
      unit: "",
      damageType: "",
      description: "",
      priority: "",
      reportedBy: "",
    })
    setReportDate(undefined)
  }

  const handleRecordRepair = () => {
    console.log("Recording repair:", { ...repairForm, repairDate })
    setIsRecordRepairOpen(false)
    // Reset form
    setRepairForm({
      damageId: "",
      repairDetails: "",
      cost: "",
      contractor: "",
      contractorPhone: "",
    })
    setRepairDate(undefined)
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
                          <Label htmlFor="unitId">Unit ID</Label>
                          <Input
                            id="unitId"
                            placeholder="e.g., A-101"
                            value={unitForm.unitId}
                            onChange={(e) => setUnitForm({ ...unitForm, unitId: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Unit Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g., Apartment A-101"
                            value={unitForm.name}
                            onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Unit Type</Label>
                          <Select
                            value={unitForm.type}
                            onValueChange={(value) => setUnitForm({ ...unitForm, type: value })}
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

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="rent">Monthly Rent (KES)</Label>
                            <Input
                              id="rent"
                              type="number"
                              placeholder="Rent amount"
                              value={unitForm.rent}
                              onChange={(e) => setUnitForm({ ...unitForm, rent: e.target.value })}
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
                          <Label htmlFor="photos">Photos Upload</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                              <Button variant="outline" size="sm">
                                Choose Files
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
                          </div>
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
                          <Button onClick={handleAddUnit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Add Unit
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddUnitOpen(false)} className="flex-1">
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
                      {filteredUnits.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.unitId}</TableCell>
                          <TableCell>{unit.name}</TableCell>
                          <TableCell>{unit.type}</TableCell>
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
                          <TableCell>{unit.tenant || "N/A"}</TableCell>
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
                >
                  {filter.label} ({filter.count})
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
                            <Label>Unit</Label>
                            <Select
                              value={damageForm.unit}
                              onValueChange={(value) => setDamageForm({ ...damageForm, unit: value })}
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
                            <Label>Damage Type</Label>
                            <Select
                              value={damageForm.damageType}
                              onValueChange={(value) => setDamageForm({ ...damageForm, damageType: value })}
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
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Describe the damage in detail..."
                              value={damageForm.description}
                              onChange={(e) => setDamageForm({ ...damageForm, description: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Priority Level</Label>
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
                            <Label>Photos Upload</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <div className="mt-2">
                                <Button variant="outline" size="sm">
                                  Upload Photos
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Reported By</Label>
                            <Input
                              placeholder="Name of person reporting"
                              value={damageForm.reportedBy}
                              onChange={(e) => setDamageForm({ ...damageForm, reportedBy: e.target.value })}
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
                            <Button onClick={handleReportDamage} className="flex-1 bg-red-600 hover:bg-red-700">
                              Report Damage
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsReportDamageOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isRecordRepairOpen} onOpenChange={setIsRecordRepairOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Wrench className="mr-2 h-4 w-4" />
                          Record Repair
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Repair</DialogTitle>
                          <DialogDescription>Log repair completion details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Damage Report</Label>
                            <Select
                              value={repairForm.damageId}
                              onValueChange={(value) => setRepairForm({ ...repairForm, damageId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select damage report" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DMG-2024-001">DMG-2024-001 - Leaking faucet (A-101)</SelectItem>
                                <SelectItem value="DMG-2024-002">DMG-2024-002 - Broken window (B-205)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Repair Details</Label>
                            <Textarea
                              placeholder="Describe the repair work completed..."
                              value={repairForm.repairDetails}
                              onChange={(e) => setRepairForm({ ...repairForm, repairDetails: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Repair Cost (KES)</Label>
                            <Input
                              type="number"
                              placeholder="Enter repair cost"
                              value={repairForm.cost}
                              onChange={(e) => setRepairForm({ ...repairForm, cost: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Repair Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !repairDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {repairDate ? format(repairDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={repairDate} onSelect={setRepairDate} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label>Contractor Name</Label>
                            <Input
                              placeholder="Contractor or repair person name"
                              value={repairForm.contractor}
                              onChange={(e) => setRepairForm({ ...repairForm, contractor: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Contractor Phone</Label>
                            <Input
                              placeholder="Contractor phone number"
                              value={repairForm.contractorPhone}
                              onChange={(e) => setRepairForm({ ...repairForm, contractorPhone: e.target.value })}
                            />
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button onClick={handleRecordRepair} className="flex-1 bg-green-600 hover:bg-green-700">
                              Record Repair
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setIsRecordRepairOpen(false)}>
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
                {/* Search */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search by unit, property, damage type..." className="pl-10" />
                  </div>
                </div>

                {/* Damage Reports Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Damage ID</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Date Reported</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDamageReports.map((damage, index) => (
                        <TableRow key={damage.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{damage.damageId}</TableCell>
                          <TableCell>{damage.unit}</TableCell>
                          <TableCell className="max-w-xs truncate">{damage.description}</TableCell>
                          <TableCell>{damage.reportedBy}</TableCell>
                          <TableCell>{damage.dateReported}</TableCell>
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
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
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
        </Tabs>
      </div>
    </MainLayout>
  )
}
