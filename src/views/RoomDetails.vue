<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import roomService from '@/services/roomService'
import bookingService from '@/services/bookingService'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id

const room = ref(null)
const loading = ref(true)
const error = ref(null)

const bookingForm = ref({
  reason: '',
  startTime: '',
  endTime: ''
})
const bookingLoading = ref(false)
const bookingError = ref(null)
const bookingSuccess = ref(false)

onMounted(async () => {
  try {
    const res = await roomService.getRoomById(roomId)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      room.value = res.data
    } else {
      error.value = res.message || 'Failed to load room details'
    }
  } catch (err) {
    error.value = 'An error occurred while loading room details.'
  } finally {
    loading.value = false
  }
})

const handleBook = async () => {
  if (!bookingForm.value.reason || !bookingForm.value.startTime || !bookingForm.value.endTime) {
    bookingError.value = "All fields are required"
    return
  }

  bookingLoading.value = true
  bookingError.value = null
  bookingSuccess.value = false

  try {
    const payload = {
      roomId: parseInt(roomId),
      reason: bookingForm.value.reason,
      startTime: bookingForm.value.startTime, // Assuming datetime-local input matches ISO format
      endTime: bookingForm.value.endTime,
      deviceBorrowDetail: []
    }
    
    const res = await bookingService.createBooking(payload)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      bookingSuccess.value = true
      bookingForm.value = { reason: '', startTime: '', endTime: '' }
      setTimeout(() => {
        router.push('/my-bookings')
      }, 2000)
    } else {
      bookingError.value = res.message || 'Failed to book room'
    }
  } catch (err) {
    bookingError.value = err.response?.data?.message || 'An error occurred during booking.'
  } finally {
    bookingLoading.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <div v-else-if="room" class="room-details-container">
      <div class="card room-info">
        <h2>{{ room.name }}</h2>
        <p class="meta">📍 {{ room.location }} | 👥 Capacity: {{ room.capacity }}</p>
        
        <div class="images" v-if="room.image && room.image.length > 0">
          <img style="width: 100%; height: auto; display: block;" v-for="img in room.image" :key="img.id" :src="api.defaults.baseURL + img.url" alt="Room" class="room-img" />
        </div>
      </div>
      
      <div class="card booking-card">
        <h3>Book this Room</h3>
        
        <div v-if="bookingSuccess" class="alert alert-success">
          Room booked successfully! Redirecting to your bookings...
        </div>
        <div v-if="bookingError" class="alert alert-error">
          {{ bookingError }}
        </div>
        
        <form @submit.prevent="handleBook" v-if="!bookingSuccess">
          <div class="form-group">
            <label class="form-label" for="reason">Reason for Booking</label>
            <input 
              id="reason"
              v-model="bookingForm.reason" 
              type="text" 
              class="form-control" 
              placeholder="E.g., Team Meeting"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="startTime">Start Time</label>
            <input 
              id="startTime"
              v-model="bookingForm.startTime" 
              type="datetime-local" 
              class="form-control" 
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="endTime">End Time</label>
            <input 
              id="endTime"
              v-model="bookingForm.endTime" 
              type="datetime-local" 
              class="form-control" 
              required
            />
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary submit-btn" 
            :disabled="bookingLoading"
          >
            {{ bookingLoading ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.room-details-container {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .room-details-container {
    grid-template-columns: 2fr 1fr;
  }
}

.room-info {
  padding: 2rem;
}

.room-info h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.meta {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.images {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.room-img {
  max-width: 100%;
  border-radius: var(--radius);
  object-fit: cover;
  max-height: 400px;
}

.booking-card {
  padding: 2rem;
  height: fit-content;
}

.booking-card h3 {
  margin-bottom: 1.5rem;
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
}
</style>
