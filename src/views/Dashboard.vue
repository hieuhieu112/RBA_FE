<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
</script>

<template>
  <div>
    <h1 class="page-title">Dashboard</h1>
    
    <div class="dashboard-grid">
      <div class="card welcome-card">
        <h2>Welcome, {{ user?.fullName || user?.username }}!</h2>
        <p>You can browse rooms and manage your bookings from here.</p>
        
        <div class="actions">
          <router-link to="/rooms" class="btn btn-primary">Book a Room</router-link>
          <router-link to="/my-bookings" class="btn btn-outline">My Bookings</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 2rem;
  font-size: 1.75rem;
}

.dashboard-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.welcome-card {
  padding: 2rem;
}

.welcome-card h2 {
  margin-bottom: 1rem;
  color: var(--primary);
}

.welcome-card p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}
</style>
