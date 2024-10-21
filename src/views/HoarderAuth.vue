<template>
  <div class="auth-page">
    <n-card class="login-card">
      <h2 class="text-center">Login</h2>
      <n-form :model="loginForm" @submit.prevent="submitForm">
        <n-form-item label="Username" :label-width="formLabelWidth">
          <n-input
            :value="loginForm.username"
            @input="(val) => (loginForm.username = val)"
            placeholder="Please input username"
            clearable
          />
        </n-form-item>
        <n-form-item label="Password" :label-width="formLabelWidth">
          <n-input
            :value="loginForm.password"
            @input="(val) => (loginForm.password = val)"
            type="password"
            placeholder="Please input password"
            show-password
            clearable
          />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" block @click="submitForm">Login</n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import api from '@/utils/api'

const loginForm = ref({
  username: '',
  password: '',
})

const formLabelWidth = '100px'
const router = useRouter()
const message = useMessage()

const submitForm = async () => {
  console.log('Form Data:', loginForm.value)
  try {
    const response = await api.post('/api/Users/login', {
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    if (response.status === 200) {
      const token = response.data.token
      localStorage.setItem('authToken', token)
      router.push('/notes')
      message.success('Login successful!')
    } else {
      message.error('Invalid username or password.')
    }
  } catch (error) {
    console.error('Login failed', error)
    message.error('An error occurred while logging in. Please try again.')
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.text-center {
  text-align: center;
}
</style>
