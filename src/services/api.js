import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

let isRefreshing = false
let refreshSubscribers = []

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb)
}

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    if (originalRequest.url === '/authen/refresh') {
      return Promise.reject(error)
    }

    if (error.response && (error.response.status === 403 || error.response.status === 401) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const authStore = useAuthStore()

      try {
        const response = await axios.post(`${api.defaults.baseURL}/authen/refresh`, {}, {
          withCredentials: true
        })

        const data = response.data
        if (data.statusCode === '200' || data.statusCode === 'SUCCESS') {
          const newToken = data.data.accessToken

          authStore.token = newToken
          if (data.data.user) {
            authStore.user = data.data.user
          }

          isRefreshing = false
          onRefreshed(newToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          throw new Error('Refresh failed')
        }
      } catch (err) {
        isRefreshing = false
        refreshSubscribers = []
        authStore.clearAuth()
        router.push('/login')
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default api
