import { ref, computed } from 'vue'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export const useAuth = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  /**
   * Login with email and password
   */
  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (response.success) {
        user.value = response.user
        token.value = response.token
        return response
      }
      else {
        throw new Error('Login failed')
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Logout
   */
  async function logout() {
    isLoading.value = true
    error.value = null

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST'
      })

      user.value = null
      token.value = null
      return { success: true }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh token
   */
  async function refreshToken() {
    if (!token.value) return false

    try {
      const response = await $fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.success) {
        user.value = response.user
        token.value = response.token
        return true
      }
      return false
    }
    catch (err) {
      console.error('[v0] Token refresh failed:', err)
      user.value = null
      token.value = null
      return false
    }
  }

  /**
   * Check if user is authenticated on app load
   */
  async function checkAuth() {
    try {
      // Try to refresh token on app load
      await refreshToken()
    }
    catch (err) {
      console.error('[v0] Auth check failed:', err)
      user.value = null
      token.value = null
    }
  }

  /**
   * Check if user has a specific role
   */
  function hasRole(role: string): boolean {
    return user.value?.role === role
  }

  /**
   * Check if user is admin
   */
  function isAdmin(): boolean {
    return user.value?.role === 'admin'
  }

  /**
   * Check if user is editor or admin
   */
  function canEdit(): boolean {
    return user.value?.role === 'admin' || user.value?.role === 'editor'
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    checkAuth,
    hasRole,
    isAdmin,
    canEdit
  }
})
