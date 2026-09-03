<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/authService'

const route = useRoute()
const router = useRouter()

const email = computed(() => route.query.email || '')
const username = computed(() => route.query.username || '')
const code = ref('')
const loading = ref(false)
const error = ref(null)
const success = ref(false)

const handleVerify = async () => {
  if (!code.value.trim()) {
    error.value = 'Verification code is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await authService.verifyEmail(username.value, code.value)
    if (response.statusCode === '200' || response.statusCode === 'SUCCESS') {
      success.value = true
    } else {
      error.value = response.message || 'Verification failed'
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'An error occurred during verification'
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h1>Verify Your Email</h1>
        <p v-if="!success">A verification code has been sent to <strong>{{ email }}</strong>.</p>
      </div>
      
      <div v-if="success" class="alert alert-success text-center">
        Email verified successfully.<br/>Your account is now active.
      </div>
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>
      
      <form v-if="!success" @submit.prevent="handleVerify" class="login-form">
        <div class="form-group">
          <label class="form-label" for="code">Verification Code</label>
          <input 
            id="code"
            v-model="code" 
            type="text" 
            class="form-control" 
            placeholder="Enter the 6-digit code"
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary submit-btn" 
          :disabled="loading || !code"
        >
          <span v-if="loading">Verifying...</span>
          <span v-else>Verify</span>
        </button>
      </form>
      
      <div v-if="success" class="mt-4">
        <button @click="goToLogin" class="btn btn-primary submit-btn">
          Back to Login
        </button>
      </div>
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
  line-height: 1.5;
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.text-center {
  text-align: center;
}

.alert-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}
</style>
