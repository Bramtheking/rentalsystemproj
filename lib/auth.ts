import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth } from "./firebase"

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export const formatAuthUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
})

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not initialized")
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: formatAuthUser(result.user), error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error("Firebase not initialized")
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: formatAuthUser(result.user), error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized")
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: "select_account",
    })
    const result = await signInWithPopup(auth, provider)
    return { user: formatAuthUser(result.user), error: null }
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      return { user: null, error: "Sign-in cancelled" }
    }
    return { user: null, error: error.message }
  }
}

export const resetPassword = async (email: string) => {
  if (!auth) throw new Error("Firebase not initialized")
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const logout = async () => {
  if (!auth) throw new Error("Firebase not initialized")
  try {
    await signOut(auth)
    // Clear any Google auth cookies
    if (typeof window !== "undefined") {
      // Clear Google auth cookies
      document.cookie = "g_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      // Clear any other auth-related storage
      localStorage.removeItem("authUser")
      sessionStorage.clear()
    }
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
