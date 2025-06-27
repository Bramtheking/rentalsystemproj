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
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarIcon,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { paymentsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: number
  payment_id: string
  tenant: number
  tenant_name: string
  tenant_id: string
  unit: number
  unit_name: string
  unit_id: string
  payment_type: string
  payment_type_display: string
  amount: number
  payment_method: string
  payment_method_display: string
  status: string
  status_display: string
  payment_date: string
  due_date?: string
  description: string
  reference_number: string
  receipt_number: string
  late_fee_amount: number
  days_late: number
  period_start?: string
  period_end?: string
  total_amount: number
  is_overdue: boolean
  created_at: string
  updated_at: string
}

interface PaymentStats {
  total_payments: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  overdue_payments: number
  total_amount: number
  pending_amount: number
  overdue_amount: number
  this_month_amount: number
}

interface TenantUnit {
  id: number
  tenant_id: string
  first_name: string
  last_name: string
  current_unit__id: number
  current_unit__unit_id: string
  current_unit__name: string
}

export default function PaymentsPage() {
  const { toast } = useToast()

  // State for payments
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    total_payments: 0,
    completed_payments: 0,
    pending_payments: 0,
    failed_payments: 0,
    overdue_payments: 0,
    total_amount: 0,
    pending_amount: 0,
    overdue_amount: 0,
    this_month_amount: 0,
  })
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [tenantUnits, setTenantUnits] = useState<TenantUnit[]>([])

  // UI state
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Date states
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date>()
  const [periodStart, setPeriodStart] = useState<Date>()
  const [periodEnd, setPeriodEnd] = useState<Date>()

  // Form state
  const [paymentForm, setPaymentForm] = useState({
    tenant: "",
    unit: "",
    payment_type: "",
    amount: "",
    payment_method: "",
    status: "completed",
    description: "",
    reference_number: "",
    late_fee_amount: "",
    days_late: "",
  })

  // Load data on component mount
  useEffect(() => {
    loadPayments()
    loadTenantUnits()
  }, [])

  const loadPayments = async () => {
    try {
      setPaymentsLoading(true)
      const [paymentsData, statsData] = await Promise.all([paymentsApi.getPayments(), paymentsApi.getPaymentStats()])
      setPayments(paymentsData)
      setPaymentStats(statsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payments",
        variant: "destructive",
      })
    } finally {
      setPaymentsLoading(false)
    }
  }

  const loadTenantUnits = async () => {
    try {
      const units = await paymentsApi.getTenantUnits()
      setTenantUnits(units)
    } catch (error: any) {
      console.error("Failed to load tenant units:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const paymentFilterButtons = [
    { label: "All", count: paymentStats.total_payments, icon: DollarSign },
    { label: "Completed", count: paymentStats.completed_payments, icon: CheckCircle },
    { label: "Pending", count: paymentStats.pending_payments, icon: Clock },
    { label: "Overdue", count: paymentStats.overdue_payments, icon: AlertTriangle },
    { label: "Failed", count: paymentStats.failed_payments, icon: XCircle },
  ]

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.unit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Overdue" && payment.is_overdue) ||
      payment.status === filterStatus.toLowerCase()

    const matchesType = filterType === "All" || payment.payment_type === filterType.toLowerCase()

    return matchesSearch && matchesStatus && matchesType
  })

  const handleAddPayment = async () => {
    try {
      setIsSubmitting(true)

      const paymentData = {
        ...paymentForm,
        tenant: Number.parseInt(paymentForm.tenant),
        unit: Number.parseInt(paymentForm.unit),
        amount: Number.parseFloat(paymentForm.amount),
        payment_date: format(paymentDate, "yyyy-MM-dd"),
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        period_start: periodStart ? format(periodStart, "yyyy-MM-dd") : null,
        period_end: periodEnd ? format(periodEnd, "yyyy-MM-dd") : null,
        late_fee_amount: paymentForm.late_fee_amount ? Number.parseFloat(paymentForm.late_fee_amount) : 0,
        days_late: paymentForm.days_late ? Number.parseInt(paymentForm.days_late) : 0,
      }

      await paymentsApi.createPayment(paymentData)

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })

      setIsAddPaymentOpen(false)
      resetPaymentForm()
      loadPayments()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateReceipt = async (paymentId: number) => {
    try {
      const response = await paymentsApi.generateReceipt(paymentId)

      toast({
        title: "Success",
        description: "Receipt generated successfully",
      })

      // Here you could open a new window with the receipt or download it
      console.log("Receipt data:", response.receipt_data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate receipt",
        variant: "destructive",
      })
    }
  }

  const handleDeletePayment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return

    try {
      await paymentsApi.deletePayment(id)
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      })
      loadPayments()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      })
    }
  }

  const resetPaymentForm = () => {
    setPaymentForm({
      tenant: "",
      unit: "",
      payment_type: "",
      amount: "",
      payment_method: "",
      status: "completed",
      description: "",
      reference_number: "",
      late_fee_amount: "",
      days_late: "",
    })
    setPaymentDate(new Date())
    setDueDate(undefined)
    setPeriodStart(undefined)
    setPeriodEnd(undefined)
  }

  const handleTenantChange = (tenantId: string) => {
    const selectedTenant = tenantUnits.find((t) => t.id.toString() === tenantId)
    if (selectedTenant) {
      setPaymentForm({
        ...paymentForm,
        tenant: tenantId,
        unit: selectedTenant.current_unit__id.toString(),
      })
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600">Track rent payments and generate receipts</p>
          </div>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Collected</p>
                      <p className="text-lg font-bold">{formatCurrency(paymentStats.total_amount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-lg font-bold">{formatCurrency(paymentStats.pending_amount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Overdue</p>
                      <p className="text-lg font-bold">{formatCurrency(paymentStats.overdue_amount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-lg font-bold">{formatCurrency(paymentStats.this_month_amount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {paymentFilterButtons.map((filter) => (
                <Button
                  key={filter.label}
                  variant={filterStatus === filter.label ? "default" : "outline"}
                  className={cn("h-auto px-4 py-2", filterStatus === filter.label && "bg-blue-600 hover:bg-blue-700")}
                  onClick={() => setFilterStatus(filter.label)}
                  disabled={paymentsLoading}
                >
                  <filter.icon className="mr-2 h-4 w-4" />
                  {filter.label} ({paymentsLoading ? "..." : filter.count})
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Records</CardTitle>
                    <CardDescription>Manage all payment transactions</CardDescription>
                  </div>
                  <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Record Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Record New Payment</DialogTitle>
                        <DialogDescription>Add a new payment transaction</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tenant">Tenant *</Label>
                            <Select value={paymentForm.tenant} onValueChange={handleTenantChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tenant" />
                              </SelectTrigger>
                              <SelectContent>
                                {tenantUnits.map((tenant) => (
                                  <SelectItem key={tenant.id} value={tenant.id.toString()}>
                                    {tenant.tenant_id} - {tenant.first_name} {tenant.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                              id="unit"
                              value={
                                paymentForm.unit
                                  ? tenantUnits.find((t) => t.current_unit__id.toString() === paymentForm.unit)
                                      ?.current_unit__unit_id || ""
                                  : ""
                              }
                              disabled
                              placeholder="Unit will be auto-selected"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="payment_type">Payment Type *</Label>
                            <Select
                              value={paymentForm.payment_type}
                              onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rent">Rent Payment</SelectItem>
                                <SelectItem value="deposit">Security Deposit</SelectItem>
                                <SelectItem value="utility">Utility Payment</SelectItem>
                                <SelectItem value="maintenance">Maintenance Fee</SelectItem>
                                <SelectItem value="late_fee">Late Fee</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount (KES) *</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Payment amount"
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="payment_method">Payment Method *</Label>
                            <Select
                              value={paymentForm.payment_method}
                              onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                                <SelectItem value="card">Card Payment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={paymentForm.status}
                              onValueChange={(value) => setPaymentForm({ ...paymentForm, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Payment Date *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !paymentDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {paymentDate ? format(paymentDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dueDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {paymentForm.payment_type === "rent" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Period Start</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !periodStart && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {periodStart ? format(periodStart, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={periodStart}
                                    onSelect={setPeriodStart}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <Label>Period End</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !periodEnd && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {periodEnd ? format(periodEnd, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar mode="single" selected={periodEnd} onSelect={setPeriodEnd} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="reference_number">Reference Number</Label>
                          <Input
                            id="reference_number"
                            placeholder="Transaction reference number"
                            value={paymentForm.reference_number}
                            onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="late_fee_amount">Late Fee (KES)</Label>
                            <Input
                              id="late_fee_amount"
                              type="number"
                              placeholder="Late fee amount"
                              value={paymentForm.late_fee_amount}
                              onChange={(e) => setPaymentForm({ ...paymentForm, late_fee_amount: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="days_late">Days Late</Label>
                            <Input
                              id="days_late"
                              type="number"
                              placeholder="Number of days late"
                              value={paymentForm.days_late}
                              onChange={(e) => setPaymentForm({ ...paymentForm, days_late: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Payment description or notes"
                            value={paymentForm.description}
                            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            onClick={handleAddPayment}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={
                              isSubmitting ||
                              !paymentForm.tenant ||
                              !paymentForm.payment_type ||
                              !paymentForm.amount ||
                              !paymentForm.payment_method
                            }
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Recording...
                              </>
                            ) : (
                              "Record Payment"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddPaymentOpen(false)}
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
                {/* Search and Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="rent">Rent Payment</SelectItem>
                      <SelectItem value="deposit">Security Deposit</SelectItem>
                      <SelectItem value="utility">Utility Payment</SelectItem>
                      <SelectItem value="maintenance">Maintenance Fee</SelectItem>
                      <SelectItem value="late_fee">Late Fee</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payments Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="mt-2 text-sm text-gray-500">Loading payments...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <p className="text-sm text-gray-500">No payments found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.payment_id}</TableCell>
                            <TableCell>{payment.tenant_name}</TableCell>
                            <TableCell>{payment.unit_id}</TableCell>
                            <TableCell>{payment.payment_type_display}</TableCell>
                            <TableCell>
                              <div>
                                <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                {payment.late_fee_amount > 0 && (
                                  <div className="text-xs text-red-600">
                                    +{formatCurrency(payment.late_fee_amount)} late fee
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{payment.payment_method_display}</TableCell>
                            <TableCell>{payment.payment_date}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "pending"
                                      ? payment.is_overdue
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                      : payment.status === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                }
                              >
                                {payment.is_overdue && payment.status === "pending"
                                  ? "Overdue"
                                  : payment.status_display}
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => handleGenerateReceipt(payment.id)}
                                >
                                  <Receipt className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeletePayment(payment.id)}
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

          {/* Receipts Tab */}
          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Receipts</CardTitle>
                <CardDescription>View and download payment receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">Receipt management feature coming soon...</p>
                  <p className="text-xs text-gray-400 mt-2">
                    You can generate receipts from individual payments in the Payments tab
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
