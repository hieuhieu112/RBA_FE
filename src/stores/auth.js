import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async initAuth() {
      this.loading = true
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
        const response = await axios.post(`${baseURL}/authen/refresh`, {}, {
          withCredentials: true
        })
        const data = response.data
        if (data.statusCode === '200' || data.statusCode === 'SUCCESS') {
          this.token = data.data.accessToken
          if (data.data.user) {
            this.user = data.data.user
          }
        }
      } catch (err) {
        // Ignore error: user is just not logged in
        this.clearAuth()
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/authen/login', { username, password })
        if (response.statusCode === '200' && response.data) {
          this.token = response.data.accessToken
          this.user = response.data.user
          router.push('/')
          return true
        } else {
          this.error = response.message || 'Login failed'
          return false
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'An error occurred during login'
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      // Don't catch error here to allow network errors to propagate if needed
      // But for logout we might want to ignore it
      try {
        await api.post('/authen/logout')
      } catch (err) {
        // Ignore logout errors
      }
      this.clearAuth()
      router.push('/login')
    },

    clearAuth() {
      this.user = null
      this.token = null
    }
  }
})
