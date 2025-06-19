"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subMonths } from "date-fns"
import {
  CalendarIcon,
  Download,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [reportType, setReportType] = useState("income-statement")
  const [property, setProperty] = useState("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const generateReport = () => {
    console.log("Generating report:", {
      reportType,
      property,
      startDate,
      endDate,
    })
  }

  // Dummy data for financial overview
  const financialOverview = {
    totalRevenue: 450000,
    totalExpenses: 180000,
    netIncome: 270000,
    occupancyRate: 85,
    revenueChange: 12,
    expenseChange: 5,
  }

  // Dummy data for income statement
  const incomeStatementData = {
    revenue: {
      rent: 420000,
      deposits: 15000,
      lateFees: 8000,
      other: 7000,
      total: 450000,
    },
    expenses: {
      maintenance: 45000,
      utilities: 35000,
      insurance: 15000,
      security: 25000,
      management: 30000,
      taxes: 20000,
      other: 10000,
      total: 180000,
    },
    netIncome: 270000,
  }

  // Dummy data for rent collection
  const rentCollectionData = {
    collected: 420000,
    outstanding: 65000,
    collectionRate: 87,
    overdueAccounts: 8,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate financial and property management reports</p>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(financialOverview.totalRevenue)}</h3>
                </div>
                <div
                  className={`flex items-center ${financialOverview.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {financialOverview.revenueChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(financialOverview.revenueChange)}%</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(financialOverview.totalExpenses)}</h3>
                </div>
                <div
                  className={`flex items-center ${financialOverview.expenseChange <= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {financialOverview.expenseChange <= 0 ? (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(financialOverview.expenseChange)}%</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-red-500 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Net Income</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(financialOverview.netIncome)}</h3>
                </div>
                <div className="flex items-center text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>8%</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
            <CardDescription>Create custom reports for your property management needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income-statement">Income Statement</SelectItem>
                    <SelectItem value="rent-collection">Rent Collection</SelectItem>
                    <SelectItem value="expense-report">Expense Report</SelectItem>
                    <SelectItem value="occupancy">Occupancy Report</SelectItem>
                    <SelectItem value="maintenance">Maintenance Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Property</label>
                <Select value={property} onValueChange={setProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="sunrise-apartments">Sunrise Apartments</SelectItem>
                    <SelectItem value="downtown-plaza">Downtown Plaza</SelectItem>
                    <SelectItem value="garden-view">Garden View Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="income-statement" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
            <TabsTrigger value="rent-collection">Rent Collection</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          </TabsList>

          {/* Income Statement Tab */}
          <TabsContent value="income-statement" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Income Statement</CardTitle>
                  <CardDescription>
                    Financial summary for {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Revenue</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b">
                        <span>Rent Income</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.revenue.rent)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Security Deposits</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.revenue.deposits)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Late Fees</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.revenue.lateFees)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Other Income</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.revenue.other)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Total Revenue</span>
                        <span>{formatCurrency(incomeStatementData.revenue.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Expenses</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-1 border-b">
                        <span>Maintenance & Repairs</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.expenses.maintenance)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Utilities</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.expenses.utilities)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Insurance</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.expenses.insurance)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Security Services</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.expenses.security)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Property Management</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.expenses.management)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Property Taxes</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.expenses.taxes)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span>Other Expenses</span>
                        <span className="font-medium">{formatCurrency(incomeStatementData.expenses.other)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Total Expenses</span>
                        <span>{formatCurrency(incomeStatementData.expenses.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="pt-4 border-t-2">
                    <div className="flex justify-between py-2 text-xl font-bold">
                      <span>Net Income</span>
                      <span className="text-green-600">{formatCurrency(incomeStatementData.netIncome)}</span>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Income vs Expenses</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-24 w-24 text-gray-300" />
                      <span className="ml-4 text-gray-400">Chart visualization will appear here</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rent Collection Tab */}
          <TabsContent value="rent-collection" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Rent Collection Report</CardTitle>
                  <CardDescription>
                    Collection summary for {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Rent Collected</h3>
                      <p className="text-2xl font-bold">{formatCurrency(rentCollectionData.collected)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Outstanding Rent</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(rentCollectionData.outstanding)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Collection Rate</h3>
                      <p className="text-2xl font-bold">{rentCollectionData.collectionRate}%</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Overdue Accounts</h3>
                      <p className="text-2xl font-bold">{rentCollectionData.overdueAccounts}</p>
                    </div>
                  </div>

                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <PieChart className="h-24 w-24 text-gray-300" />
                    <span className="ml-4 text-gray-400">Collection rate chart will appear here</span>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Monthly Collection Trend</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <LineChart className="h-24 w-24 text-gray-300" />
                    <span className="ml-4 text-gray-400">Trend chart will appear here</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Occupancy Tab */}
          <TabsContent value="occupancy" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Occupancy Report</CardTitle>
                  <CardDescription>
                    Occupancy summary for {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Occupancy Rate</h3>
                      <p className="text-2xl font-bold">{financialOverview.occupancyRate}%</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Units</h3>
                      <p className="text-2xl font-bold">82</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Occupied Units</h3>
                      <p className="text-2xl font-bold">70</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Vacant Units</h3>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>

                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <PieChart className="h-24 w-24 text-gray-300" />
                    <span className="ml-4 text-gray-400">Occupancy chart will appear here</span>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Occupancy by Property</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Sunrise Apartments</span>
                        <span>90%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "90%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Downtown Plaza</span>
                        <span>75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Garden View Complex</span>
                        <span>95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "95%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
