const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://rentalsystemmanagement.onrender.com/api"
    : "http://localhost:8000/api"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, success: true }
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Specific API functions
export const unitsApi = {
  getAll: () => apiClient.get("/units/"),
  getById: (id: string) => apiClient.get(`/units/${id}/`),
  create: (data: any) => apiClient.post("/units/", data),
  update: (id: string, data: any) => apiClient.put(`/units/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/units/${id}/`),
}

export const tenantsApi = {
  getAll: () => apiClient.get("/tenants/"),
  getById: (id: string) => apiClient.get(`/tenants/${id}/`),
  create: (data: any) => apiClient.post("/tenants/", data),
  update: (id: string, data: any) => apiClient.put(`/tenants/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/tenants/${id}/`),
}

export const paymentsApi = {
  getAll: () => apiClient.get("/payments/"),
  getById: (id: string) => apiClient.get(`/payments/${id}/`),
  create: (data: any) => apiClient.post("/payments/", data),
  update: (id: string, data: any) => apiClient.put(`/payments/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/payments/${id}/`),
}

// Fallback data for when API is not available
export const fallbackData = {
  units: [
    {
      id: 1,
      unit_number: "A101",
      rent_amount: 1200,
      status: "occupied",
      tenant_name: "John Doe",
      lease_start: "2024-01-01",
      lease_end: "2024-12-31",
    },
    {
      id: 2,
      unit_number: "A102",
      rent_amount: 1100,
      status: "vacant",
      tenant_name: null,
      lease_start: null,
      lease_end: null,
    },
    {
      id: 3,
      unit_number: "B201",
      rent_amount: 1300,
      status: "occupied",
      tenant_name: "Jane Smith",
      lease_start: "2024-02-01",
      lease_end: "2025-01-31",
    },
  ],
  tenants: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "(555) 123-4567",
      unit: "A101",
      lease_start: "2024-01-01",
      lease_end: "2024-12-31",
      rent_amount: 1200,
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "(555) 987-6543",
      unit: "B201",
      lease_start: "2024-02-01",
      lease_end: "2025-01-31",
      rent_amount: 1300,
      status: "active",
    },
  ],
  payments: [
    {
      id: 1,
      tenant_name: "John Doe",
      unit: "A101",
      amount: 1200,
      date: "2024-01-01",
      status: "paid",
      payment_method: "bank_transfer",
    },
    {
      id: 2,
      tenant_name: "Jane Smith",
      unit: "B201",
      amount: 1300,
      date: "2024-02-01",
      status: "paid",
      payment_method: "credit_card",
    },
  ],
}
