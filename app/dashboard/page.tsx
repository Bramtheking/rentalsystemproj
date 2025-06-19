"use client"

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
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Dummy data
const overviewData = {
  currentTenants: { count: 82, change: 2, trend: "up" },
  vacantUnits: { count: 15, change: -9, trend: "down" },
  accountBalance: { amount: 1113782, change: 11.01, trend: "up" },
  totalWithdrawals: { amount: 1005359, change: -9.05, trend: "down" },
}

const collectionData = {
  totalCollected: 276000,
  totalUncollected: 382000,
  collectionTarget: 450000,
  progress: 300000,
  todayEarnings: 3287,
}

const recentActivities = [
  { id: 1, type: "payment", tenant: "John Smith", unit: "A-101", amount: 25000, time: "2 hours ago" },
  { id: 2, type: "move_in", tenant: "Sarah Johnson", unit: "B-205", time: "5 hours ago" },
  { id: 3, type: "maintenance", unit: "C-301", issue: "Plumbing repair", time: "1 day ago" },
  { id: 4, type: "payment", tenant: "Mike Wilson", unit: "A-102", amount: 30000, time: "2 days ago" },
]

export default function Dashboard() {
  const { user } = useAuth()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const progressPercentage = (collectionData.progress / collectionData.collectionTarget) * 100

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
                <div className="text-2xl font-bold text-gray-900">{overviewData.currentTenants.count}</div>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />+{overviewData.currentTenants.change} from last month
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
                <div className="text-2xl font-bold text-gray-900">{overviewData.vacantUnits.count}</div>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  {overviewData.vacantUnits.change} from last month
                </div>
              </CardContent>
            </Card>

            {/* Account Balance */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Account Balance</CardTitle>
                <Wallet className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overviewData.accountBalance.amount)}
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />+{overviewData.accountBalance.change}% from last month
                </div>
              </CardContent>
            </Card>

            {/* Total Withdrawals */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Withdrawals</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overviewData.totalWithdrawals.amount)}
                </div>
                <div className="flex items-center text-xs text-red-600">
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  {overviewData.totalWithdrawals.change}% from last month
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
                        strokeDasharray={`${progressPercentage * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
                        <div className="text-sm text-gray-600">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collection Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">
                      {formatCurrency(collectionData.totalCollected)}
                    </div>
                    <div className="text-sm text-green-600">Collected</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-700">
                      {formatCurrency(collectionData.totalUncollected)}
                    </div>
                    <div className="text-sm text-red-600">Uncollected</div>
                  </div>
                </div>

                {/* Target and Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Collection Target</span>
                    <span className="font-medium">{formatCurrency(collectionData.collectionTarget)}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{formatCurrency(collectionData.progress)}</span>
                  </div>
                </div>

                {/* Motivational Message */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🎉 You earned <strong>${collectionData.todayEarnings}</strong> today, it's higher than last month.
                    Keep up your good work!
                  </p>
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
                  {recentActivities.map((activity) => (
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
                        <div className="text-sm font-medium text-gray-900">
                          {activity.type === "payment" && `Payment received from ${activity.tenant}`}
                          {activity.type === "move_in" && `${activity.tenant} moved into ${activity.unit}`}
                          {activity.type === "maintenance" && `${activity.issue} in ${activity.unit}`}
                        </div>
                        {activity.amount && (
                          <div className="text-sm text-green-600 font-medium">{formatCurrency(activity.amount)}</div>
                        )}
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activities
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
