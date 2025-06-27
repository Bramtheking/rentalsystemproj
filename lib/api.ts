// API helper functions for the rental management system
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // Same domain - proxied to Django backend
    : "http://localhost:8000/api"

import { auth } from "./firebase"

// Check if we're in the browser
const isBrowser = typeof window !== "undefined"

// Test if backend is available
const testBackendConnection = async () => {
  try {
    const response = await fetch("/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return response.ok
  } catch (error) {
    console.error("Backend connection test failed:", error)
    return false
  }
}

// Generic API call helper with better error handling
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const user = auth.currentUser
    const token = user ? await user.getIdToken() : null

    console.log(`🔄 Making API call to: ${API_BASE_URL}${endpoint}`)

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    console.log(`📊 API Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error Response:`, errorText)

      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: `HTTP ${response.status}: ${response.statusText}` }
      }

      throw new Error(error.message || `API request failed: ${response.status}`)
    }

    // Handle empty responses
    const text = await response.text()
    const result = text ? JSON.parse(text) : {}
    console.log(`✅ API Success:`, result)
    return result
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error)

    // Return empty data structure instead of throwing error for stats endpoints
    if (endpoint.includes("/stats")) {
      return {
        total_units: 0,
        occupied_units: 0,
        vacant_units: 0,
        maintenance_units: 0,
        total_tenants: 0,
        active_tenants: 0,
        inactive_tenants: 0,
        moved_out_tenants: 0,
        total_payments: 0,
        completed_payments: 0,
        pending_payments: 0,
        failed_payments: 0,
        overdue_payments: 0,
        total_amount: 0,
        pending_amount: 0,
        overdue_amount: 0,
        this_month_amount: 0,
        total_reports: 0,
        pending_reports: 0,
        in_progress_reports: 0,
        repaired_reports: 0,
        unrepaired_reports: 0,
      }
    }

    if (endpoint.includes("/monthly_stats")) {
      return []
    }

    if (endpoint.endsWith("/") && options.method === "GET") {
      return []
    }

    // For POST/PUT/DELETE operations, throw the error
    throw error
  }
}

// Fallback storage for when backend is not available (browser-only)
const fallbackStorage = {
  getUnits: () => {
    if (!isBrowser) return []
    try {
      return JSON.parse(localStorage.getItem("fallback_units") || "[]")
    } catch {
      return []
    }
  },

  saveUnits: (units: any[]) => {
    if (!isBrowser) return
    try {
      localStorage.setItem("fallback_units", JSON.stringify(units))
    } catch (error) {
      console.error("Failed to save units to localStorage:", error)
    }
  },

  addUnit: (unit: any) => {
    if (!isBrowser) return unit

    const units = fallbackStorage.getUnits()
    const newUnit = {
      ...unit,
      id: Date.now(),
      unit_id: unit.unit_id || `UNIT-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    units.push(newUnit)
    fallbackStorage.saveUnits(units)
    return newUnit
  },

  getStats: () => {
    const units = fallbackStorage.getUnits()
    return {
      total_units: units.length,
      occupied_units: units.filter((u) => u.status === "Occupied").length,
      vacant_units: units.filter((u) => u.status === "Vacant").length,
      maintenance_units: units.filter((u) => u.status === "Under Maintenance").length,
    }
  },
}

// Units API
export const unitsApi = {
  // Get all units
  getUnits: async () => {
    try {
      return await apiCall("/units/")
    } catch (error) {
      console.warn("Using fallback storage for units")
      return fallbackStorage.getUnits()
    }
  },

  // Get unit statistics
  getUnitStats: async () => {
    try {
      return await apiCall("/units/stats/")
    } catch (error) {
      return fallbackStorage.getStats()
    }
  },

  // Search units
  searchUnits: async (query: string, status?: string) => {
    try {
      const params = new URLSearchParams()
      if (query) params.append("q", query)
      if (status) params.append("status", status)
      return await apiCall(`/units/search/?${params.toString()}`)
    } catch (error) {
      return fallbackStorage.getUnits()
    }
  },

  // Create unit
  createUnit: async (data: any) => {
    console.log("🏗️ Creating unit with data:", data)
    try {
      return await apiCall("/units/", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.warn("Backend not available, using fallback storage")
      const newUnit = fallbackStorage.addUnit(data)
      console.log("✅ Unit added to fallback storage:", newUnit)
      return newUnit
    }
  },

  // Update unit
  updateUnit: (id: number, data: any) =>
    apiCall(`/units/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete unit
  deleteUnit: (id: number) =>
    apiCall(`/units/${id}/`, {
      method: "DELETE",
    }),

  // Get single unit
  getUnit: (id: number) => apiCall(`/units/${id}/`),
}

// Damage Reports API
export const damageReportsApi = {
  // Get all damage reports
  getDamageReports: () => apiCall("/damage-reports/").catch(() => []),

  // Get damage report statistics
  getDamageStats: () =>
    apiCall("/damage-reports/stats/").catch(() => ({
      total_reports: 0,
      pending_reports: 0,
      in_progress_reports: 0,
      repaired_reports: 0,
      unrepaired_reports: 0,
    })),

  // Filter damage reports
  filterDamageReports: (status: string) => apiCall(`/damage-reports/filter/?status=${status}`).catch(() => []),

  // Create damage report
  createDamageReport: (data: any) =>
    apiCall("/damage-reports/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update damage report
  updateDamageReport: (id: number, data: any) =>
    apiCall(`/damage-reports/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Record repair
  recordRepair: (id: number, data: any) =>
    apiCall(`/damage-reports/${id}/record_repair/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Delete damage report
  deleteDamageReport: (id: number) =>
    apiCall(`/damage-reports/${id}/`, {
      method: "DELETE",
    }),

  // Get user units for dropdown
  getUserUnits: async () => {
    try {
      return await apiCall("/damage-reports/user_units/")
    } catch (error) {
      console.warn("Using fallback units for damage reports dropdown")
      const units = fallbackStorage.getUnits()
      return units.map((u) => ({
        id: u.id,
        unit_id: u.unit_id,
        name: u.name,
      }))
    }
  },
}

// Tenants API
export const tenantsApi = {
  // Get all tenants
  getTenants: () => apiCall("/tenants/").catch(() => []),

  // Get tenant statistics
  getTenantStats: () =>
    apiCall("/tenants/stats/").catch(() => ({
      total_tenants: 0,
      active_tenants: 0,
      inactive_tenants: 0,
      moved_out_tenants: 0,
    })),

  // Search tenants
  searchTenants: (query: string, status?: string) => {
    const params = new URLSearchParams()
    if (query) params.append("q", query)
    if (status) params.append("status", status)
    return apiCall(`/tenants/search/?${params.toString()}`).catch(() => [])
  },

  // Create tenant
  createTenant: (data: any) =>
    apiCall("/tenants/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update tenant
  updateTenant: (id: number, data: any) =>
    apiCall(`/tenants/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete tenant
  deleteTenant: (id: number) =>
    apiCall(`/tenants/${id}/`, {
      method: "DELETE",
    }),

  // Get single tenant
  getTenant: (id: number) => apiCall(`/tenants/${id}/`),

  // Move tenant in
  moveIn: (id: number, data: any) =>
    apiCall(`/tenants/${id}/move_in/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Move tenant out
  moveOut: (id: number, data: any) =>
    apiCall(`/tenants/${id}/move_out/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get available units
  getAvailableUnits: async () => {
    try {
      return await apiCall("/tenants/available_units/")
    } catch (error) {
      console.warn("Using fallback units for tenant available units")
      const units = fallbackStorage.getUnits()
      return units
        .filter((u) => u.status === "Vacant")
        .map((u) => ({
          id: u.id,
          unit_id: u.unit_id,
          name: u.name,
          rent: u.rent,
        }))
    }
  },
}

// Tenant History API
export const tenantHistoryApi = {
  // Get tenant history
  getTenantHistory: () => apiCall("/tenant-history/").catch(() => []),
}

// Payments API
export const paymentsApi = {
  // Get all payments
  getPayments: () => apiCall("/payments/").catch(() => []),

  // Get payment statistics
  getPaymentStats: () =>
    apiCall("/payments/stats/").catch(() => ({
      total_payments: 0,
      completed_payments: 0,
      pending_payments: 0,
      failed_payments: 0,
      overdue_payments: 0,
      total_amount: 0,
      pending_amount: 0,
      overdue_amount: 0,
      this_month_amount: 0,
    })),

  // Get monthly statistics
  getMonthlyStats: () => apiCall("/payments/monthly_stats/").catch(() => []),

  // Search payments
  searchPayments: (query: string, status?: string, type?: string) => {
    const params = new URLSearchParams()
    if (query) params.append("q", query)
    if (status) params.append("status", status)
    if (type) params.append("type", type)
    return apiCall(`/payments/search/?${params.toString()}`).catch(() => [])
  },

  // Create payment
  createPayment: (data: any) =>
    apiCall("/payments/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update payment
  updatePayment: (id: number, data: any) =>
    apiCall(`/payments/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete payment
  deletePayment: (id: number) =>
    apiCall(`/payments/${id}/`, {
      method: "DELETE",
    }),

  // Get single payment
  getPayment: (id: number) => apiCall(`/payments/${id}/`),

  // Generate receipt
  generateReceipt: (id: number) =>
    apiCall(`/payments/${id}/generate_receipt/`, {
      method: "POST",
    }),

  // Get tenant units for payment creation
  getTenantUnits: () => apiCall("/payments/tenant_units/").catch(() => []),
}

// Receipts API
export const receiptsApi = {
  // Get all receipts
  getReceipts: () => apiCall("/receipts/").catch(() => []),

  // Get single receipt
  getReceipt: (id: number) => apiCall(`/receipts/${id}/`),
}

export { apiCall, testBackendConnection }
