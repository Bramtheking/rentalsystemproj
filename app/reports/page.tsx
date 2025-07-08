"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { Download, TrendingUp, DollarSign, Home, Users, Wrench, Loader2 } from "lucide-react"
import { unitsApi, tenantsApi, paymentsApi, damageReportsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ReportData {
  financial: {
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    occupancyRate: number
    averageRent: number
    monthlyTrend: Array<{
      month: string
      revenue: number
      expenses: number
      netIncome: number
    }>
  }
  units: {
    totalUnits: number
    occupiedUnits: number
    vacantUnits: number
    maintenanceUnits: number
    unitTypes: Array<{
      type: string
      count: number
      revenue: number
    }>
  }
  tenants: {
    totalTenants: number
    activeTenants: number
    newTenants: number
    tenantTurnover: number
    averageStayDuration: number
  }
  maintenance: {
    totalReports: number
    pendingReports: number
    completedReports: number
    totalCost: number
    averageResolutionTime: number
    damageTypes: Array<{
      type: string
      count: number
      cost: number
    }>
  }
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

export default function ReportsPage() {
  const { toast } = useToast()

  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 5)),
    to: endOfMonth(new Date()),
  })
  const [reportType, setReportType] = useState("overview")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    try {
      setLoading(true)

      // Fetch data from all modules
      const [unitsData, unitsStats, tenantsData, tenantStats, paymentsData, paymentStats, damageData, damageStats] =
        await Promise.all([
          unitsApi.getUnits(),
          unitsApi.getUnitStats(),
          tenantsApi.getTenants(),
          tenantsApi.getTenantStats(),
          paymentsApi.getPayments(),
          paymentsApi.getPaymentStats(),
          damageReportsApi.getDamageReports(),
          damageReportsApi.getDamageStats(),
        ])

      // Process and aggregate data
      const processedData = processReportData({
        units: unitsData,
        unitStats: unitsStats,
        tenants: tenantsData,
        tenantStats: tenantStats,
        payments: paymentsData,
        paymentStats: paymentStats,
        damage: damageData,
        damageStats: damageStats,
      })

      setReportData(processedData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load report data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const processReportData = (data: any): ReportData => {
    // Calculate financial metrics
    const completedPayments = data.payments.filter((p: any) => p.status === "Completed")
    const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + Number.parseFloat(p.amount), 0)
    const totalExpenses = data.damage.reduce((sum: number, d: any) => sum + (Number.parseFloat(d.repair_cost) || 0), 0)

    // Calculate monthly trends (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStr = format(date, "MMM yyyy")
      const monthPayments = completedPayments.filter(
        (p: any) => format(new Date(p.payment_date), "MMM yyyy") === monthStr,
      )
      const monthExpenses = data.damage.filter(
        (d: any) => d.repair_date && format(new Date(d.repair_date), "MMM yyyy") === monthStr,
      )

      const revenue = monthPayments.reduce((sum: number, p: any) => sum + Number.parseFloat(p.amount), 0)
      const expenses = monthExpenses.reduce((sum: number, d: any) => sum + (Number.parseFloat(d.repair_cost) || 0), 0)

      monthlyTrend.push({
        month: monthStr,
        revenue,
        expenses,
        netIncome: revenue - expenses,
      })
    }

    // Calculate unit type distribution
    const unitTypeMap = new Map()
    data.units.forEach((unit: any) => {
      const type = unit.unit_type
      if (!unitTypeMap.has(type)) {
        unitTypeMap.set(type, { count: 0, revenue: 0 })
      }
      const current = unitTypeMap.get(type)
      current.count++

      // Add revenue from payments for this unit
      const unitPayments = completedPayments.filter((p: any) => p.unit_name === unit.name)
      current.revenue += unitPayments.reduce((sum: number, p: any) => sum + Number.parseFloat(p.amount), 0)
    })

    const unitTypes = Array.from(unitTypeMap.entries()).map(([type, data]) => ({
      type: type.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      count: data.count,
      revenue: data.revenue,
    }))

    // Calculate damage type distribution
    const damageTypeMap = new Map()
    data.damage.forEach((damage: any) => {
      const type = damage.damage_type
      if (!damageTypeMap.has(type)) {
        damageTypeMap.set(type, { count: 0, cost: 0 })
      }
      const current = damageTypeMap.get(type)
      current.count++
      current.cost += Number.parseFloat(damage.repair_cost) || 0
    })

    const damageTypes = Array.from(damageTypeMap.entries()).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: data.count,
      cost: data.cost,
    }))

    return {
      financial: {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        occupancyRate:
          data.unitStats.total_units > 0 ? (data.unitStats.occupied_units / data.unitStats.total_units) * 100 : 0,
        averageRent:
          data.units.length > 0
            ? data.units.reduce((sum: number, u: any) => sum + Number.parseFloat(u.rent), 0) / data.units.length
            : 0,
        monthlyTrend,
      },
      units: {
        totalUnits: data.unitStats.total_units,
        occupiedUnits: data.unitStats.occupied_units,
        vacantUnits: data.unitStats.vacant_units,
        maintenanceUnits: data.unitStats.maintenance_units,
        unitTypes,
      },
      tenants: {
        totalTenants: data.tenantStats.total_tenants,
        activeTenants: data.tenantStats.active_tenants,
        newTenants: data.tenantStats.new_tenants || 0,
        tenantTurnover: 0, // Calculate based on move-ins/move-outs
        averageStayDuration: 0, // Calculate from tenant history
      },
      maintenance: {
        totalReports: data.damageStats.total_reports,
        pendingReports: data.damageStats.pending_reports,
        completedReports: data.damageStats.repaired_reports,
        totalCost: totalExpenses,
        averageResolutionTime: 0, // Calculate from damage report dates
        damageTypes,
      },
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, this would call an API to generate a PDF report
      toast({
        title: "Success",
        description: "Report generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading report data...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!reportData) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">No report data available</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive business insights and reporting</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview Report</SelectItem>
                <SelectItem value="financial">Financial Report</SelectItem>
                <SelectItem value="occupancy">Occupancy Report</SelectItem>
                <SelectItem value="maintenance">Maintenance Report</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateReport} disabled={isGeneratingReport} className="bg-blue-600 hover:bg-blue-700">
              {isGeneratingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.financial.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Net Income: {formatCurrency(reportData.financial.netIncome)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.financial.occupancyRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {reportData.units.occupiedUnits} of {reportData.units.totalUnits} units occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.tenants.activeTenants}</div>
              <p className="text-xs text-muted-foreground">Total registered: {reportData.tenants.totalTenants}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.maintenance.totalCost)}</div>
              <p className="text-xs text-muted-foreground">{reportData.maintenance.pendingReports} pending repairs</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                  <CardDescription>Monthly financial performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.financial.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Net Income Trend</CardTitle>
                  <CardDescription>Profit/loss over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.financial.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area
                        type="monotone"
                        dataKey="netIncome"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                        name="Net Income"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Unit Type</CardTitle>
                <CardDescription>Income distribution across property types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={reportData.units.unitTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                        label={({ type, revenue }) => `${type}: ${formatCurrency(revenue)}`}
                      >
                        {reportData.units.unitTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {reportData.units.unitTypes.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{type.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(type.revenue)}</div>
                          <div className="text-xs text-gray-500">{type.count} units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Occupancy Tab */}
          <TabsContent value="occupancy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Unit Status Distribution</CardTitle>
                  <CardDescription>Current occupancy breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Occupied", value: reportData.units.occupiedUnits, color: "#10B981" },
                          { name: "Vacant", value: reportData.units.vacantUnits, color: "#F59E0B" },
                          { name: "Maintenance", value: reportData.units.maintenanceUnits, color: "#EF4444" },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {[
                          { name: "Occupied", value: reportData.units.occupiedUnits, color: "#10B981" },
                          { name: "Vacant", value: reportData.units.vacantUnits, color: "#F59E0B" },
                          { name: "Maintenance", value: reportData.units.maintenanceUnits, color: "#EF4444" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unit Type Performance</CardTitle>
                  <CardDescription>Units and revenue by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.units.unitTypes.map((type, index) => (
                      <div key={type.type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{type.type}</span>
                          <span className="text-sm text-gray-500">
                            {type.count} units • {formatCurrency(type.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(type.count / reportData.units.totalUnits) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Damage Reports by Type</CardTitle>
                  <CardDescription>Maintenance issues breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.maintenance.damageTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Costs by Type</CardTitle>
                  <CardDescription>Repair expenses breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.maintenance.damageTypes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="cost" fill="#EF4444" name="Cost" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Summary</CardTitle>
                <CardDescription>Current maintenance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{reportData.maintenance.pendingReports}</div>
                    <div className="text-sm text-gray-500">Pending Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{reportData.maintenance.completedReports}</div>
                    <div className="text-sm text-gray-500">Completed Repairs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {formatCurrency(reportData.maintenance.totalCost)}
                    </div>
                    <div className="text-sm text-gray-500">Total Maintenance Cost</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Trends</CardTitle>
                <CardDescription>6-month financial performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reportData.financial.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} name="Expenses" />
                    <Line type="monotone" dataKey="netIncome" stroke="#10B981" strokeWidth={3} name="Net Income" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Monthly Revenue</span>
                    <span className="font-bold">
                      {formatCurrency(
                        reportData.financial.monthlyTrend.reduce((sum, month) => sum + month.revenue, 0) /
                          reportData.financial.monthlyTrend.length,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Rent per Unit</span>
                    <span className="font-bold">{formatCurrency(reportData.financial.averageRent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Occupancy Rate</span>
                    <span className="font-bold">{reportData.financial.occupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Maintenance Cost Ratio</span>
                    <span className="font-bold">
                      {reportData.financial.totalRevenue > 0
                        ? ((reportData.maintenance.totalCost / reportData.financial.totalRevenue) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Health Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Occupancy Rate</span>
                        <span>{reportData.financial.occupancyRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${reportData.financial.occupancyRate}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Profitability</span>
                        <span>
                          {reportData.financial.totalRevenue > 0
                            ? ((reportData.financial.netIncome / reportData.financial.totalRevenue) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                reportData.financial.totalRevenue > 0
                                  ? (reportData.financial.netIncome / reportData.financial.totalRevenue) * 100
                                  : 0,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Maintenance Efficiency</span>
                        <span>
                          {reportData.maintenance.totalReports > 0
                            ? (
                                (reportData.maintenance.completedReports / reportData.maintenance.totalReports) *
                                100
                              ).toFixed(1)
                            : 100}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{
                            width: `${
                              reportData.maintenance.totalReports > 0
                                ? (reportData.maintenance.completedReports / reportData.maintenance.totalReports) * 100
                                : 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
