<script setup>
import { ref, onMounted } from 'vue'
import bookingService from '@/services/bookingService'

const bookings = ref([])
const loading = ref(true)
const error = ref(null)

const fetchBookings = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await bookingService.getAllBookings()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      bookings.value = res.data || []
    } else {
      error.value = res.message || 'Failed to load bookings'
    }
  } catch (err) {
    error.value = 'An error occurred while loading your bookings.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBookings()
})

const formatDateArray = (arr) => {
  if (!Array.isArray(arr) || arr.length < 5) return ''
  const [year, month, day, hour, minute] = arr
  const d = String(day).padStart(2, '0')
  const m = String(month).padStart(2, '0')
  const y = year
  const h = String(hour).padStart(2, '0')
  const min = String(minute).padStart(2, '0')
  return `${d}/${m}/${y} ${h}:${min}`
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">My Bookings</h1>
    </div>

    <div v-if="loading" class="loading">Loading bookings...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Reason</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Room ID</th>
              <th>Approved By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bookings.length === 0">
              <td colspan="7" class="empty-state">
                <p>You have no bookings yet.</p>
                <router-link to="/rooms" class="btn btn-primary mt-4">Browse Rooms</router-link>
              </td>
            </tr>
            <tr v-for="booking in bookings" :key="booking.id" @click="$router.push(`/booking-detail/${booking.id}`)" class="clickable-row">
              <td>{{ booking.id }}</td>
              <td>{{ booking.reason }}</td>
              <td>{{ formatDateArray(booking.startTime) }}</td>
              <td>{{ formatDateArray(booking.endTime) }}</td>
              <td>
                <span :class="['status-badge', booking.status?.toLowerCase() || 'pending']">
                  {{ booking.status || 'PENDING' }}
                </span>
              </td>
              <td>{{ booking.roomId }}</td>
              <td>{{ booking.approvedByUserId || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
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

.mt-4 {
  margin-top: 1rem;
  display: inline-block;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f9fafb;
}

.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border); }
.table th { font-weight: 600; color: var(--text-main); background-color: #f3f4f6; }

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending, .status-badge.created {
  background-color: #FEF3C7;
  color: #92400E;
}

.status-badge.approved {
  background-color: #D1FAE5;
  color: #065F46;
}

.status-badge.rejected {
  background-color: #FEE2E2;
  color: #991B1B;
}
</style>
