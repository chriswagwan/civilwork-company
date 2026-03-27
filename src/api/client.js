import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

client.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('civilWorksAuth')

  if (authStorage) {
    const { token } = JSON.parse(authStorage)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export default client
