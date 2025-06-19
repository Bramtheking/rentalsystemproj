import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "https://rentalsystemmanagement.onrender.com/api" : "http://localhost:8000/api"

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export const formatAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
})

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const user = auth.currentUser
  const token = user ? await user.getIdToken() : null

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }))
    throw new Error(error.message || "API request failed")
  }

  return response.json()
}

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = formatAuthUser(result.user)

    // Sync user with Django backend
    await apiCall("/users/sync/", { method: "POST" })

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user = formatAuthUser(result.user)

    // Sync user with Django backend
    await apiCall("/users/sync/", { method: "POST" })

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = formatAuthUser(result.user)

    // Sync user with Django backend
    await apiCall("/users/sync/", { method: "POST" })

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const logout = async () => {
  try {
    await apiCall("/users/logout/", { method: "POST" })
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Get user profile from Django backend
export const getUserProfile = async () => {
  try {
    return await apiCall("/users/profile/")
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// Update user profile in Django backend
export const updateUserProfile = async (data: any) => {
  try {
    return await apiCall("/users/profile/", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}
