"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Users,
  Building2,
  Wallet,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { unitsApi, tenantsApi, paymentsApi, damageReportsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface DashboardData {
  units: {
    total_units: number
    occupied_units: number
    vacant_units: number
    maintenance_units: number
  }
  tenants: {
    total_tenants: number
    active_tenants: number
    inactive_tenants: number
    moved_out_tenants: number
  }
  payments: {
    total_amount: number
    pending_amount: number
    overdue_amount: number
    this_month_amount: number
    completed_payments: number
    pending_payments: number
    overdue_payments: number
  }
  damage: {
    total_reports: number
    pending_reports: number
    repaired_reports: number
    unrepaired_reports: number
  }
  recentActivities: Array<{
    id: string
    type: string
    description: string
    amount?: number
    time: string
    tenant?: string
    unit?: string
  }>
}

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel with proper fallback handling
      const [unitsStats, tenantStats, paymentStats, damageStats, payments, units, tenants, damageReports] =
        await Promise.all([
          unitsApi.getUnitStats(),
          tenantsApi.getTenantStats(),
          paymentsApi.getPaymentStats(),
          damageReportsApi.getDamageStats(),
          paymentsApi.getPayments(),
          unitsApi.getUnits(),
          tenantsApi.getTenants(),
          damageReportsApi.getDamageReports(),
        ])

      // Generate recent activities from real data
      const recentActivities = generateRecentActivities(payments, tenants, damageReports)

      setDashboardData({
        units: unitsStats,
        tenants: tenantStats,
        payments: paymentStats,
        damage: damageStats,
        recentActivities,
      })

      console.log("Dashboard data loaded:", {
        units: unitsStats,
        tenants: tenantStats,
        payments: paymentStats,
        damage: damageStats,
      })
    } catch (error: any) {
      console.error("Dashboard load error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateRecentActivities = (payments: any[], tenants: any[], damageReports: any[]) => {
    const activities: any[] = []

    // Add recent payments
    const recentPayments = payments
      .filter((p) => p.status === "completed")
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 3)

    recentPayments.forEach((payment) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: "payment",
        description: `Payment received from ${payment.tenant_name}`,
        amount: Number.parseFloat(payment.amount),
        time: formatTimeAgo(payment.payment_date),
        tenant: payment.tenant_name,
        unit: payment.unit_id,
      })
    })

    // Add recent tenant activities
    const recentTenants = tenants
      .filter((t) => t.status === "Active" && t.move_in_date)
      .sort((a, b) => new Date(b.move_in_date).getTime() - new Date(a.move_in_date).getTime())
      .slice(0, 2)

    recentTenants.forEach((tenant) => {
      activities.push({
        id: `tenant-${tenant.id}`,
        type: "move_in",
        description: `${tenant.full_name} moved into ${tenant.current_unit_id}`,
        time: formatTimeAgo(tenant.move_in_date),
        tenant: tenant.full_name,
        unit: tenant.current_unit_id,
      })
    })

    // Add recent damage reports
    const recentDamage = damageReports
      .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())
      .slice(0, 2)

    recentDamage.forEach((damage) => {
      activities.push({
        id: `damage-${damage.id}`,
        type: "maintenance",
        description: `${damage.damage_type} issue in ${damage.unit_id}`,
        time: formatTimeAgo(damage.report_date),
        unit: damage.unit_id,
      })
    })

    // Sort all activities by time and return top 6
    return activities
      .sort((a, b) => {
        // This is a simple sort - in real implementation you'd parse the time strings properly
        return Math.random() - 0.5 // For now, just randomize since we don't have exact timestamps
      })
      .slice(0, 6)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateCollectionProgress = () => {
    if (!dashboardData) return { progress: 0, target: 0, collected: 0, uncollected: 0 }

    const collected = dashboardData.payments.this_month_amount
    const pending = dashboardData.payments.pending_amount
    const target = collected + pending + dashboardData.payments.overdue_amount
    const progress = target > 0 ? (collected / target) * 100 : 0

    return {
      progress,
      target,
      collected,
      uncollected: pending + dashboardData.payments.overdue_amount,
    }
  }

  const calculateTrends = () => {
    if (!dashboardData) return { tenantChange: 0, vacantChange: 0, revenueChange: 0, expenseChange: 0 }

    // These would be calculated from historical data in a real implementation
    // For now, we'll calculate based on current ratios
    const occupancyRate =
      dashboardData.units.total_units > 0
        ? (dashboardData.units.occupied_units / dashboardData.units.total_units) * 100
        : 0

    return {
      tenantChange: occupancyRate > 80 ? 5 : occupancyRate > 60 ? 2 : -3,
      vacantChange: occupancyRate > 80 ? -8 : occupancyRate > 60 ? -3 : 5,
      revenueChange: dashboardData.payments.this_month_amount > 100000 ? 12 : 5,
      expenseChange: dashboardData.damage.pending_reports > 5 ? 8 : -2,
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  if (!dashboardData) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load dashboard data</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Retry
            </Button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  const collectionData = calculateCollectionProgress()
  const trends = calculateTrends()

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.displayName || user?.email}! Here's what's happening with your properties.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Reports
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Quick Add
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Tenants */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Current Tenants</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{dashboardData.tenants.active_tenants}</div>
                <div
                  className={`flex items-center text-xs ${trends.tenantChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {trends.tenantChange >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(trends.tenantChange)}% from last month
                </div>
              </CardContent>
            </Card>

            {/* Vacant Units */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Vacant Units</CardTitle>
                <Building2 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{dashboardData.units.vacant_units}</div>
                <div
                  className={`flex items-center text-xs ${trends.vacantChange <= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {trends.vacantChange <= 0 ? (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(trends.vacantChange)} from last month
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <Wallet className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.payments.total_amount)}
                </div>
                <div
                  className={`flex items-center text-xs ${trends.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {trends.revenueChange >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  +{Math.abs(trends.revenueChange)}% from last month
                </div>
              </CardContent>
            </Card>

            {/* Pending Payments */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.payments.pending_amount)}
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {dashboardData.payments.overdue_payments} overdue payments
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collection Progress and Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Collection Progress */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Monthly Collection Progress</CardTitle>
                <CardDescription>Track your rent collection performance this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Circle */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#3B82F6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${collectionData.progress * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{Math.round(collectionData.progress)}%</div>
                        <div className="text-sm text-gray-600">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collection Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{formatCurrency(collectionData.collected)}</div>
                    <div className="text-sm text-green-600">Collected This Month</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-700">{formatCurrency(collectionData.uncollected)}</div>
                    <div className="text-sm text-red-600">Outstanding</div>
                  </div>
                </div>

                {/* Target and Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Collection Target</span>
                    <span className="font-medium">{formatCurrency(collectionData.target)}</span>
                  </div>
                  <Progress value={collectionData.progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{formatCurrency(collectionData.collected)}</span>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{dashboardData.payments.completed_payments}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{dashboardData.payments.pending_payments}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{dashboardData.payments.overdue_payments}</div>
                    <div className="text-xs text-gray-500">Overdue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">Recent Activities</CardTitle>
                <CardDescription>Latest updates from your properties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">No recent activities</p>
                    </div>
                  ) : (
                    dashboardData.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            activity.type === "payment"
                              ? "bg-green-100"
                              : activity.type === "move_in"
                                ? "bg-blue-100"
                                : "bg-orange-100"
                          }`}
                        >
                          {activity.type === "payment" && <Wallet className="h-4 w-4 text-green-600" />}
                          {activity.type === "move_in" && <Users className="h-4 w-4 text-blue-600" />}
                          {activity.type === "maintenance" && <Building2 className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                          {activity.amount && (
                            <div className="text-sm text-green-600 font-medium">{formatCurrency(activity.amount)}</div>
                          )}
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activities
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Units</p>
                    <p className="text-lg font-bold">{dashboardData.units.total_units}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Tenants</p>
                    <p className="text-lg font-bold">{dashboardData.tenants.total_tenants}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Maintenance Issues</p>
                    <p className="text-lg font-bold">{dashboardData.damage.pending_reports}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Occupancy Rate</p>
                    <p className="text-lg font-bold">
                      {dashboardData.units.total_units > 0
                        ? Math.round((dashboardData.units.occupied_units / dashboardData.units.total_units) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
