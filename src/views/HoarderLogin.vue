<!-- ./src/views/HoarderLogin.vue -->

<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="Username" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      error: '',
    }
  },
  methods: {
    async handleLogin() {
      try {
        await this.$store.dispatch('login', {
          Username: this.username,
          Password: this.password,
        })
        this.$router.push('/')
      } catch (err) {
        this.error =
          'Ошибка авторизации. Проверьте правильность введённых данных.'
      }
    },
  },
}
</script>

<style>
.login-container {
  max-width: 400px;
  margin: 100px auto;
}
</style>
