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
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, CalendarIcon, Receipt, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

// Dummy data for payments
const paymentsData = [
  {
    id: 1,
    tenant: "John Smith",
    unit: "A-101",
    amount: 25000,
    method: "M-Pesa",
    reference: "MPX123456789",
    date: "2024-01-15",
    status: "Completed",
  },
  {
    id: 2,
    tenant: "Sarah Johnson",
    unit: "B-205",
    amount: 30000,
    method: "Bank Transfer",
    reference: "BT987654321",
    date: "2024-01-14",
    status: "Completed",
  },
  {
    id: 3,
    tenant: "Mike Wilson",
    unit: "C-301",
    amount: 28000,
    method: "Cash",
    reference: "CSH001234",
    date: "2024-01-13",
    status: "Pending",
  },
  {
    id: 4,
    tenant: "Emily Davis",
    unit: "A-102",
    amount: 32000,
    method: "Cheque",
    reference: "CHQ445566",
    date: "2024-01-12",
    status: "Completed",
  },
]

// Dummy data for receipts
const receiptsData = [
  {
    id: 1,
    receiptNo: "RCP-2024-001",
    tenant: "John Smith",
    unit: "A-101",
    paymentDate: "2024-01-15",
    amount: 25000,
    method: "M-Pesa",
    status: "Generated",
  },
  {
    id: 2,
    receiptNo: "RCP-2024-002",
    tenant: "Sarah Johnson",
    unit: "B-205",
    paymentDate: "2024-01-14",
    amount: 30000,
    method: "Bank Transfer",
    status: "Generated",
  },
  {
    id: 3,
    receiptNo: "RCP-2024-003",
    tenant: "Mike Wilson",
    unit: "C-301",
    paymentDate: "2024-01-13",
    amount: 28000,
    method: "Cash",
    status: "Pending",
  },
]

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [paymentForm, setPaymentForm] = useState({
    property: "",
    unit: "",
    amount: "",
    method: "",
    reference: "",
    notes: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddPayment = () => {
    console.log("Adding payment:", { ...paymentForm, date: selectedDate })
    setIsAddPaymentOpen(false)
    // Reset form
    setPaymentForm({
      property: "",
      unit: "",
      amount: "",
      method: "",
      reference: "",
      notes: "",
    })
    setSelectedDate(undefined)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rent Payments</h1>
            <p className="text-gray-600">Manage rent payments and generate receipts</p>
          </div>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="receipts">Payment Receipts</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Track all rent payments from tenants</CardDescription>
                  </div>
                  <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Payment</DialogTitle>
                        <DialogDescription>Record a new rent payment from tenant</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="property">Property</Label>
                          <Select
                            value={paymentForm.property}
                            onValueChange={(value) => setPaymentForm({ ...paymentForm, property: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunrise-apartments">Sunrise Apartments</SelectItem>
                              <SelectItem value="downtown-plaza">Downtown Plaza</SelectItem>
                              <SelectItem value="garden-view">Garden View Complex</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unit">House Unit</Label>
                          <Select
                            value={paymentForm.unit}
                            onValueChange={(value) => setPaymentForm({ ...paymentForm, unit: value })}
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
                          <Label htmlFor="date">Payment Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !selectedDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (KES)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="method">Payment Method</Label>
                          <Select
                            value={paymentForm.method}
                            onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mpesa">M-Pesa</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reference">Reference Code</Label>
                          <Input
                            id="reference"
                            placeholder="Enter reference code"
                            value={paymentForm.reference}
                            onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Additional notes (optional)"
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button onClick={handleAddPayment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Save Payment
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by unit, tenant, reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>

                {/* Payments Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsData.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.tenant}</TableCell>
                          <TableCell>{payment.unit}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>
                            <Badge
                              variant={payment.status === "Completed" ? "default" : "secondary"}
                              className={
                                payment.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {payment.status}
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

          {/* Payment Receipts Tab */}
          <TabsContent value="receipts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Receipts</CardTitle>
                    <CardDescription>Generate and manage payment receipts</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Receipt className="mr-2 h-4 w-4" />
                      Generate Receipt
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search by receipt number, unit, house number..." className="pl-10" />
                  </div>
                </div>

                {/* Receipts Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt No</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receiptsData.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-mono text-sm">{receipt.receiptNo}</TableCell>
                          <TableCell className="font-medium">{receipt.tenant}</TableCell>
                          <TableCell>{receipt.unit}</TableCell>
                          <TableCell>{receipt.paymentDate}</TableCell>
                          <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                          <TableCell>{receipt.method}</TableCell>
                          <TableCell>
                            <Badge
                              variant={receipt.status === "Generated" ? "default" : "secondary"}
                              className={
                                receipt.status === "Generated"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {receipt.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
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
