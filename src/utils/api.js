// ./src/utils/api.js

import axios from 'axios'
import router from '../router'
import store from '../store'

const apiClient = axios.create({
  baseURL: 'http://localhost:5032/api',
})

// Request interceptor to add the token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear the token and dispatch logout action
      store.dispatch('logout')
      // Redirect to the login page
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default {
  login(credentials) {
    return apiClient.post('/Users/login', credentials).then((res) => res.data)
  },
  getNotes(params) {
    return apiClient.get('/Notes/filter', { params }).then((res) => res.data)
  },
  getNoteById(id) {
    return apiClient.get(`/Notes/${id}`).then((res) => res.data)
  },
  createNote(noteData) {
    return apiClient.post('/Notes', noteData).then((res) => res.data)
  },
  updateNote(noteData) {
    return apiClient
      .put(`/Notes/${noteData.id}`, noteData)
      .then((res) => res.data)
  },
  deleteNote(id) {
    return apiClient.delete(`/Notes/${id}`).then((res) => res.data)
  },
}
