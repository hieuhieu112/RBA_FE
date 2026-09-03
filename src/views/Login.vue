<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleLogin = async () => {
  if (!username.value || !password.value) return
  await authStore.login(username.value, password.value)
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome Back</h1>
        <p>Sign in to book your room</p>
      </div>
      
      <div v-if="authStore.error" class="alert alert-error">
        {{ authStore.error }}
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <input 
            id="username"
            v-model="username" 
            type="text" 
            class="form-control" 
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            class="form-control" 
            placeholder="Enter your password"
            required
            minlength="6"
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary submit-btn" 
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>

        <div class="register-link-container">
          <span class="text-muted">Don't have an account? </span>
          <router-link to="/register" class="register-link">Register</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-color);
  padding: 1rem;
}

.login-card {
  background: var(--surface);
  padding: 2.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

.login-header p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
}

.register-link-container {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.text-muted {
  color: var(--text-muted);
}

.register-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
