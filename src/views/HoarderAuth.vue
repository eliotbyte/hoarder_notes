<template>
  <div class="auth-page">
    <el-card class="login-card">
      <h2 class="text-center">Login</h2>
      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item label="Username" :label-width="formLabelWidth">
          <el-input
            v-model="loginForm.Username"
            placeholder="Please input username"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="Password" :label-width="formLabelWidth">
          <el-input
            v-model="loginForm.Password"
            type="password"
            placeholder="Please input password"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain class="w-full" @click="handleLogin">
            Login
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ElNotification } from 'element-plus'

export default {
  data() {
    return {
      loginForm: {
        Username: '',
        Password: '',
      },
      formLabelWidth: '100px',
    }
  },
  methods: {
    async handleLogin() {
      try {
        // Call API for authentication
        const response = await this.$axios.post(
          '/api/Users/login',
          this.loginForm
        )

        if (response.status === 200) {
          const token = response.data.token

          // Save the token to localStorage
          localStorage.setItem('authToken', token)

          // Redirect to a protected page
          this.$router.push('/dashboard')
        } else {
          // If status is not 200, show an error
          ElNotification({
            title: 'Error',
            message: 'Invalid username or password.',
            type: 'error',
          })
        }
      } catch (error) {
        console.error('Login failed', error)
        // Show error notification
        ElNotification({
          title: 'Error',
          message: 'Invalid username or password.',
          type: 'error',
        })
      }
    },
  },
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
  padding: 20px;
}

.text-center {
  text-align: center;
}

.w-full {
  width: 100%;
}
</style>
