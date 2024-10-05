// ./src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './styles/app.css'

const app = createApp(App)

// Set up Axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch the logout action
      store.dispatch('logout')
      // Redirect to the login page
      router.push('/login')
      // Optionally, you can show a notification to the user here
      return Promise.resolve() // Prevent further propagation
    }
    return Promise.reject(error)
  }
)

app.use(router).use(store).mount('#app')
