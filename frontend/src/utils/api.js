import axios from 'axios'

// API URL configuration
// Toggle between local and deployed backend
const USE_LOCAL_BACKEND = true // Set to false to use deployed backend

// In development with local backend: uses Vite proxy (/api -> http://localhost:5000)
// In development with deployed backend: uses deployed URL
// In production: uses environment variable VITE_API_URL
const DEPLOYED_API_URL = 'https://invigo-qehc.onrender.com/api'
const LOCAL_API_URL = '/api'

export const API_URL = import.meta.env.VITE_API_URL || (USE_LOCAL_BACKEND ? LOCAL_API_URL : DEPLOYED_API_URL)

console.log('🔗 API URL:', API_URL)
console.log('📍 Using:', USE_LOCAL_BACKEND ? 'Local Backend' : 'Deployed Backend')

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
