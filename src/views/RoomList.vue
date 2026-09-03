<script setup>
import { ref, onMounted } from 'vue'
import roomService from '@/services/roomService'
import api from '@/services/api'

const rooms = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await roomService.getAllRooms()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      rooms.value = res.data || []
    } else {
      error.value = res.message || 'Failed to load rooms'
    }
  } catch (err) {
    error.value = 'An error occurred while loading rooms.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Available Rooms</h1>
    </div>

    <div v-if="loading" class="loading">Loading rooms...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <div v-else-if="rooms.length === 0" class="empty-state">No rooms available.</div>
    
    <div v-else class="room-grid">
      <div v-for="room in rooms" :key="room.id" class="card room-card">
        <div class="room-image" v-if="room.image && room.image.length > 0">
          <img :src="api.defaults.baseURL +   room.image[0].url" alt="Room image" />
        </div>
        <div class="room-image placeholder" v-else>
          <span>No Image</span>
        </div>
        <div class="room-details">
          <h3>{{ room.name }}</h3>
          <p class="location">📍 {{ room.location }}</p>
          <p class="capacity">👥 Capacity: {{ room.capacity }}</p>
          <router-link :to="`/rooms/${room.id}`" class="btn btn-primary book-btn">View & Book</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.room-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.room-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.room-image {
  height: 160px;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-image.placeholder {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.room-details {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.room-details h3 {
  margin-bottom: 0.5rem;
}

.location, .capacity {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.book-btn {
  margin-top: auto;
  align-self: flex-start;
  width: 100%;
  margin-top: 1.5rem;
}
</style>
