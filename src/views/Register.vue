<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  pass: '',
  username: '',
  incidentCount: 0,
  status: 'INACTIVE',
  managerGroupId: null,
  roles: ['STUDENT']
})

const loading = ref(false)
const apiError = ref(null)
const errors = ref({
  name: '',
  email: '',
  username: '',
  pass: ''
})

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const clearErrors = () => {
  apiError.value = null
  errors.value = { name: '', email: '', username: '', pass: '' }
}

const handleRegister = async () => {
  clearErrors()
  
  let hasError = false
  // Validation
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required'
    hasError = true
  }
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
    hasError = true
  } else if (!validateEmail(form.value.email)) {
    errors.value.email = 'A valid email is required'
    hasError = true
  }
  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
    hasError = true
  }
  if (!form.value.pass) {
    errors.value.pass = 'Password is required'
    hasError = true
  } else if (form.value.pass.length < 6) {
    errors.value.pass = 'Password must be at least 6 characters'
    hasError = true
  }

  if (hasError) return;

  loading.value = true
  try {
    const response = await authService.register(form.value)
    if (response.statusCode === '200' || response.statusCode === 'SUCCESS') {
      router.push({
        path: '/verify-email',
        query: {
          email: form.value.email,
          username: form.value.username
        }
      })
    } else {
      apiError.value = response.message || 'Registration failed'
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      apiError.value = err.response.data.message
    } else {
      apiError.value = 'An error occurred during registration'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h1>Create an Account</h1>
        <p>Register to book your room</p>
      </div>
      
      <div v-if="apiError" class="alert alert-error">
        {{ apiError }}
      </div>
      
      <form @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label class="form-label" for="name">Name <span class="text-danger">*</span></label>
          <input 
            id="name"
            v-model="form.name" 
            type="text" 
            class="form-control" 
            :class="{ 'is-invalid': errors.name }"
            placeholder="Enter your full name"
            required
          />
          <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email <span class="text-danger">*</span></label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            class="form-control" 
            :class="{ 'is-invalid': errors.email }"
            placeholder="Enter your email"
            required
          />
          <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="username">Username <span class="text-danger">*</span></label>
          <input 
            id="username"
            v-model="form.username" 
            type="text" 
            class="form-control" 
            :class="{ 'is-invalid': errors.username }"
            placeholder="Choose a username"
            required
          />
          <div v-if="errors.username" class="invalid-feedback">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">Password <span class="text-danger">*</span></label>
          <input 
            id="password"
            v-model="form.pass" 
            type="password" 
            class="form-control" 
            :class="{ 'is-invalid': errors.pass }"
            placeholder="Minimum 6 characters"
            required
            minlength="6"
          />
          <div v-if="errors.pass" class="invalid-feedback">{{ errors.pass }}</div>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary submit-btn" 
          :disabled="loading"
        >
          <span v-if="loading">Registering...</span>
          <span v-else>Register</span>
        </button>

        <div class="mt-4 text-center">
          <span class="text-muted">Already have an account? </span>
          <router-link to="/login" class="login-link">Login</router-link>
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
  max-width: 450px;
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

.mt-4 {
  margin-top: 1.5rem;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: var(--text-muted);
}

.text-danger {
  color: var(--error);
}

.login-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

.is-invalid {
  border-color: var(--error) !important;
}

.invalid-feedback {
  color: var(--error);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
