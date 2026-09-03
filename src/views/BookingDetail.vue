<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import bookingService from '@/services/bookingService'

const route = useRoute()
const router = useRouter()
const bookingId = route.params.id
const detailData = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchDetail = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await bookingService.getBookingById(bookingId)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      detailData.value = res.data || res
    } else {
      detailData.value = res.data ? res.data : res
    }
  } catch (err) {
    error.value = 'Failed to load booking details'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})

const handleApprove = async () => {
  if (confirm('Are you sure you want to approve this booking?')) {
    try {
      const res = await bookingService.approveBooking(bookingId)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('Booking approved successfully')
        fetchDetail()
      } else {
        alert(res.message || 'Failed to approve booking')
      }
    } catch (err) {
      alert('An error occurred while approving the booking.')
      console.error(err)
    }
  }
}

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
  <div class="booking-detail-page">
    <div class="page-header">
      <h1 class="page-title">Booking Information</h1>
      <button @click="router.back()" class="btn btn-outline">Back</button>
    </div>

    <div v-if="loading" class="loading">Loading details...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <div v-else-if="detailData" class="card detail-card">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">ID</span>
          <span class="detail-value">{{ detailData.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Reason</span>
          <span class="detail-value">{{ detailData.reason }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Start Time</span>
          <span class="detail-value">{{ formatDateArray(detailData.startTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">End Time</span>
          <span class="detail-value">{{ formatDateArray(detailData.endTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <span class="detail-value">
            <span :class="['status-badge', detailData.status?.toLowerCase() || 'pending']">
              {{ detailData.status || 'PENDING' }}
            </span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">User</span>
          <span class="detail-value">{{ detailData.userId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Room</span>
          <span class="detail-value">{{ detailData.roomId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Approved By</span>
          <span class="detail-value">{{ detailData.approvedByUserId || 'N/A' }}</span>
        </div>
      </div>
      
      <div class="actions" v-if="detailData.canApprove === true">
        <button @click="handleApprove" class="btn btn-primary">Approve</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-detail-page {
  max-width: 800px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.page-title {
  font-size: 1.75rem;
  color: var(--text-main);
}
.detail-card {
  padding: 2rem;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}
.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}
.detail-value {
  font-size: 1rem;
  color: var(--text-main);
  word-break: break-word;
}
.btn-outline {
  padding: 0.5rem 1rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
}

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
