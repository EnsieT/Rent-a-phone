import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Phone {
  id: number
  brand: string
  model: string
  description: string
  mrp?: number
  buy_price?: number
  price_per_day: number
  image_url: string
  available: number
  tier?: string
  ram?: string
  storage?: string
  os?: string
  condition?: string
  premium_only?: number
}

export interface User {
  id: number
  name: string
  email: string
  created_at: string
  isAdmin?: boolean
  isMember?: boolean
  membershipExpiry?: string | null
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Rental {
  id: number
  user_id: number
  phone_id: number
  start_date: string
  end_date: string
  status: string
  total_price: number
  deposit: number
  created_at: string
  brand: string
  model: string
  image_url: string
}

export const getPhones = (availableOnly?: boolean) =>
  api.get<Phone[]>('/phones', {
    params: availableOnly ? { available: 'true' } : undefined,
  })

export const getPhone = (id: number) => api.get<Phone>(`/phones/${id}`)

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })

export const register = (name: string, email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { name, email, password })

export const adminLogin = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/admin-login', { email, password })

export const getMyRentals = () => api.get<Rental[]>('/rentals')

export const createRental = (phoneId: number, startDate: string, endDate: string) =>
  api.post<Rental>('/rentals', { phoneId, startDate, endDate })

export const cancelRental = (id: number) => api.delete(`/rentals/${id}`)

export const getMembershipStatus = () => api.get<{ isMember: boolean; expiryDate: string | null }>('/membership/status')
export const subscribeMembership = () => api.post<{ isMember: boolean; expiryDate: string; message: string }>('/membership/subscribe')

export default api
