import * as React from 'react'

export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  enrollment?: string
  teacherId?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

class AuthStore {
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
  }

  private listeners: ((state: AuthState) => void)[] = []

  constructor() {
    // Load user data from localStorage on initialization
    // Note: Token is stored in httpOnly cookies by the backend
    const userStr = localStorage.getItem('user')

    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user && user._id) {
          this.state = {
            user,
            token: null, // Token is in httpOnly cookies
            isAuthenticated: true
          }
        } else {
          console.error('Invalid user data in localStorage, logging out')
          this.logout()
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        this.logout()
      }
    }
  }

  getState(): AuthState {
    return { ...this.state }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.getState()))
  }

  login(user: User, token: string) {
    this.state = {
      user,
      token, // Keep token in state for compatibility but don't save to localStorage
      isAuthenticated: true
    }

    // Save user data to localStorage (token is in httpOnly cookies)
    localStorage.setItem('user', JSON.stringify(user))
    // Don't save token to localStorage - it's in httpOnly cookies

    this.notify()
  }

  async logout() {
    try {
      // Call backend logout to clear cookies
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    this.state = {
      user: null,
      token: null,
      isAuthenticated: false
    }

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    this.notify()
  }

  updateUser(updatedUser: Partial<User>) {
    if (this.state.user) {
      this.state.user = { ...this.state.user, ...updatedUser }
      localStorage.setItem('user', JSON.stringify(this.state.user))
      this.notify()
    }
  }
}

export const authStore = new AuthStore()

// React hook for using the auth store
export function useAuthStore() {
  const [state, setState] = React.useState(authStore.getState())

  React.useEffect(() => {
    const unsubscribe = authStore.subscribe(setState)
    return unsubscribe
  }, [])

  return {
    ...state,
    login: authStore.login.bind(authStore),
    logout: authStore.logout.bind(authStore),
    updateUser: authStore.updateUser.bind(authStore)
  }
}
