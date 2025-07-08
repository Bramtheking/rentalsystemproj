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
import { Plus, Search, Receipt, CalendarIcon, Eye, Edit, Trash2, Upload, Download } from "lucide-react"
import { cn } from "@/lib/utils"

// Dummy data for recurring expenses
const recurringExpensesData = [
  {
    id: 1,
    name: "Property Insurance",
    category: "Insurance",
    amount: 15000,
    frequency: "Monthly",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    nextDue: "2024-02-01",
    status: "Active",
  },
  {
    id: 2,
    name: "Security Services",
    category: "Security",
    amount: 25000,
    frequency: "Monthly",
    startDate: "2024-01-01",
    endDate: null,
    nextDue: "2024-02-01",
    status: "Active",
  },
  {
    id: 3,
    name: "Cleaning Services",
    category: "Maintenance",
    amount: 8000,
    frequency: "Weekly",
    startDate: "2024-01-01",
    endDate: null,
    nextDue: "2024-01-22",
    status: "Active",
  },
]

// Dummy data for one-time expenses
const oneTimeExpensesData = [
  {
    id: 1,
    name: "Plumbing Repair - Unit A-101",
    category: "Maintenance",
    amount: 5500,
    date: "2024-01-15",
    property: "Sunrise Apartments",
    unit: "A-101",
    vendor: "ABC Plumbing Services",
    status: "Paid",
    receipt: "RCP-2024-001.pdf",
  },
  {
    id: 2,
    name: "Electrical Installation - Common Area",
    category: "Utilities",
    amount: 12000,
    date: "2024-01-14",
    property: "Downtown Plaza",
    unit: "Common Area",
    vendor: "PowerTech Solutions",
    status: "Pending",
    receipt: null,
  },
  {
    id: 3,
    name: "Paint and Renovation - Unit B-205",
    category: "Renovation",
    amount: 18000,
    date: "2024-01-13",
    property: "Garden View Complex",
    unit: "B-205",
    vendor: "Perfect Paint Co.",
    status: "Paid",
    receipt: "RCP-2024-002.pdf",
  },
]

export default function ExpensesPage() {
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [recurringStartDate, setRecurringStartDate] = useState<Date>()
  const [recurringEndDate, setRecurringEndDate] = useState<Date>()
  const [expenseDate, setExpenseDate] = useState<Date>()

  const [recurringForm, setRecurringForm] = useState({
    name: "",
    category: "",
    amount: "",
    frequency: "",
    notes: "",
  })

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    category: "",
    amount: "",
    property: "",
    unit: "",
    vendor: "",
    notes: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddRecurring = () => {
    console.log("Adding recurring expense:", {
      ...recurringForm,
      startDate: recurringStartDate,
      endDate: recurringEndDate,
    })
    setIsAddRecurringOpen(false)
    // Reset form
    setRecurringForm({
      name: "",
      category: "",
      amount: "",
      frequency: "",
      notes: "",
    })
    setRecurringStartDate(undefined)
    setRecurringEndDate(undefined)
  }

  const handleAddExpense = () => {
    console.log("Adding expense:", {
      ...expenseForm,
      date: expenseDate,
    })
    setIsAddExpenseOpen(false)
    // Reset form
    setExpenseForm({
      name: "",
      category: "",
      amount: "",
      property: "",
      unit: "",
      vendor: "",
      notes: "",
    })
    setExpenseDate(undefined)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600">Track recurring and one-time property expenses</p>
          </div>
        </div>

        <Tabs defaultValue="recurring" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="recurring">Recurring Expenses</TabsTrigger>
            <TabsTrigger value="new-expenses">New Expenses</TabsTrigger>
          </TabsList>

          {/* Recurring Expenses Tab */}
          <TabsContent value="recurring" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recurring Expenses</CardTitle>
                    <CardDescription>Manage regular property expenses and subscriptions</CardDescription>
                  </div>
                  <Dialog open={isAddRecurringOpen} onOpenChange={setIsAddRecurringOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Recurring Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Recurring Expense</DialogTitle>
                        <DialogDescription>Set up a regular expense that repeats automatically</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="expenseName">Expense Name</Label>
                          <Input
                            id="expenseName"
                            placeholder="e.g., Property Insurance"
                            value={recurringForm.name}
                            onChange={(e) => setRecurringForm({ ...recurringForm, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expenseCategory">Category</Label>
                          <Select
                            value={recurringForm.category}
                            onValueChange={(value) => setRecurringForm({ ...recurringForm, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="utilities">Utilities</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expenseAmount">Amount (KES)</Label>
                          <Input
                            id="expenseAmount"
                            type="number"
                            placeholder="Enter amount"
                            value={recurringForm.amount}
                            onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="frequency">Frequency</Label>
                          <Select
                            value={recurringForm.frequency}
                            onValueChange={(value) => setRecurringForm({ ...recurringForm, frequency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !recurringStartDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {recurringStartDate ? format(recurringStartDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={recurringStartDate}
                                  onSelect={setRecurringStartDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label>End Date (Optional)</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !recurringEndDate && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {recurringEndDate ? format(recurringEndDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={recurringEndDate}
                                  onSelect={setRecurringEndDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Additional notes (optional)"
                            value={recurringForm.notes}
                            onChange={(e) => setRecurringForm({ ...recurringForm, notes: e.target.value })}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button onClick={handleAddRecurring} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Add Recurring Expense
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setIsAddRecurringOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Recurring Expenses Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Expense Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurringExpensesData.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.name}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>{expense.frequency}</TableCell>
                          <TableCell>{expense.nextDue}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                expense.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {expense.status}
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

          {/* New Expenses Tab */}
          <TabsContent value="new-expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>One-Time Expenses</CardTitle>
                    <CardDescription>Record individual property expenses and maintenance costs</CardDescription>
                  </div>
                  <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                        <DialogDescription>Record a one-time property expense</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                          <Label htmlFor="expenseName">Expense Name</Label>
                          <Input
                            id="expenseName"
                            placeholder="e.g., Plumbing Repair - Unit A-101"
                            value={expenseForm.name}
                            onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expenseCategory">Category</Label>
                          <Select
                            value={expenseForm.category}
                            onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="renovation">Renovation</SelectItem>
                              <SelectItem value="utilities">Utilities</SelectItem>
                              <SelectItem value="supplies">Supplies</SelectItem>
                              <SelectItem value="professional-services">Professional Services</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expenseAmount">Amount (KES)</Label>
                          <Input
                            id="expenseAmount"
                            type="number"
                            placeholder="Enter amount"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Expense Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !expenseDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expenseDate ? format(expenseDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={expenseDate} onSelect={setExpenseDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="property">Property/Unit Assignment</Label>
                            <Select
                              value={expenseForm.property}
                              onValueChange={(value) => setExpenseForm({ ...expenseForm, property: value })}
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
                            <Label htmlFor="unit">Unit (Optional)</Label>
                            <Select
                              value={expenseForm.unit}
                              onValueChange={(value) => setExpenseForm({ ...expenseForm, unit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="common-area">Common Area</SelectItem>
                                <SelectItem value="A-101">A-101</SelectItem>
                                <SelectItem value="A-102">A-102</SelectItem>
                                <SelectItem value="B-205">B-205</SelectItem>
                                <SelectItem value="C-301">C-301</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vendor">Vendor/Service Provider</Label>
                          <Input
                            id="vendor"
                            placeholder="e.g., ABC Plumbing Services"
                            value={expenseForm.vendor}
                            onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="receipt">Receipt Upload</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="mt-2">
                              <Button variant="outline" size="sm">
                                Upload Receipt
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 5MB</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Additional notes (optional)"
                            value={expenseForm.notes}
                            onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                          />
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button onClick={handleAddExpense} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Add Expense
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setIsAddExpenseOpen(false)}>
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
                    <Input placeholder="Search expenses..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                {/* One-Time Expenses Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Expense Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Property/Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {oneTimeExpensesData.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.name}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>
                            {expense.property}
                            {expense.unit && <span className="text-gray-500"> ({expense.unit})</span>}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                expense.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {expense.receipt && (
                                <Button variant="ghost" size="sm">
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              )}
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
        </Tabs>
      </div>
    </MainLayout>
  )
}
