import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDBEy_OaEe_4aNyq6YOYUtudinmOd130XU",
  authDomain: "rentalapp-fd6f1.firebaseapp.com",
  projectId: "rentalapp-fd6f1",
  storageBucket: "rentalapp-fd6f1.firebasestorage.app",
  messagingSenderId: "162433698947",
  appId: "1:162433698947:web:ec9b8098f96848988e9fb6",
  measurementId: "G-3MH8WCM0W1",
}

// Initialize Firebase only on client side
let app
let auth

if (typeof window !== "undefined") {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export { auth }
export default app
