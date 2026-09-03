<script setup>
import { ref, onMounted, computed } from 'vue'
import { Pencil, Trash } from 'lucide-vue-next'
import deviceIncidentService from '@/services/deviceIncidentService'
import userService from '@/services/userService'
import bookingService from '@/services/bookingService'

const deviceIncidents = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const modalMode = ref('add')

const currentItem = ref({
  "description": "",
  "timeIncident": "",
  "status": "INPROCESS",
  "managerId": null,
  "bookingId": null,
  "incidentBy": null
})

const usersList = ref([])
const bookingsList = ref([])
const managerSearch = ref('')
const incidentBySearch = ref('')
const bookingSearch = ref('')

const filteredManagers = computed(() => {
  if (!managerSearch.value) return usersList.value
  const s = managerSearch.value.toLowerCase()
  return usersList.value.filter(u => 
    String(u.id).includes(s) ||
    (u.username && u.username.toLowerCase().includes(s)) || 
    (u.name && u.name.toLowerCase().includes(s))
  )
})

const filteredIncidentBy = computed(() => {
  if (!incidentBySearch.value) return usersList.value
  const s = incidentBySearch.value.toLowerCase()
  return usersList.value.filter(u => 
    String(u.id).includes(s) ||
    (u.username && u.username.toLowerCase().includes(s)) || 
    (u.name && u.name.toLowerCase().includes(s))
  )
})

const filteredBookings = computed(() => {
  if (!bookingSearch.value) return bookingsList.value
  const s = bookingSearch.value.toLowerCase()
  return bookingsList.value.filter(b => {
    const searchStr = `${b.id} ${b.roomId} ${b.startTime} ${b.endTime}`.toLowerCase()
    return searchStr.includes(s)
  })
})

const getUserDisplay = (id) => {
  const user = usersList.value.find(u => u.id === id)
  return user ? `${user.id} - ${user.username || user.name || user.email}` : `ID: ${id}`
}

const getBookingDisplay = (id) => {
  const b = bookingsList.value.find(bk => bk.id === id)
  return b ? `${b.id} - Room ${b.roomId || 'N/A'} - ${b.startTime || 'N/A'} - ${b.endTime || 'N/A'}` : `ID: ${id}`
}

onMounted(async () => {
  await Promise.all([
    fetchItems(),
    fetchDependencies()
  ])
})

const fetchDependencies = async () => {
  try {
    const [usersRes, bookingsRes] = await Promise.all([
      userService.getAllUsers(),
      bookingService.getAllBookings()
    ])
    if (usersRes.statusCode === '200' || usersRes.statusCode === 'SUCCESS') {
      usersList.value = usersRes.data || []
    }
    if (bookingsRes.statusCode === '200' || bookingsRes.statusCode === 'SUCCESS') {
      bookingsList.value = bookingsRes.data || []
    }
  } catch (err) {
    console.error('Failed to load dependencies', err)
  }
}

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await deviceIncidentService.getAllDeviceIncidents()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      deviceIncidents.value = res.data || []
    } else {
      error.value = res.message || 'Failed to load data'
    }
  } catch (err) {
    error.value = 'An error occurred while loading data.'
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  modalMode.value = 'add'
  currentItem.value = {"description":"","timeIncident":"","status":"INPROCESS","managerId":null,"bookingId":null,"incidentBy":null}
  showModal.value = true
}

const openEditModal = (item) => {
  modalMode.value = 'edit'
  let parsedItem = { ...item }
  
  // Map timeIncident for datetime-local
  if (parsedItem.timeIncident && typeof parsedItem.timeIncident === 'string') {
    parsedItem.timeIncident = parsedItem.timeIncident.replace(' ', 'T').slice(0, 16)
  } else if (Array.isArray(parsedItem.timeIncident)) {
    // Fallback if backend returns date as array [YYYY, MM, DD, HH, mm]
    const [y, m, d, h, min] = parsedItem.timeIncident
    parsedItem.timeIncident = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h || 0).padStart(2, '0')}:${String(min || 0).padStart(2, '0')}`
  }

  // Map managerId from object if exists
  if (item.manager && typeof item.manager === 'object') {
    parsedItem.managerId = item.manager.id
  }
  
  // Map incidentBy from object if exists (can be incidentBy or user depending on backend)
  if (item.incidentBy && typeof item.incidentBy === 'object') {
    parsedItem.incidentBy = item.incidentBy.id
  } else if (item.user && typeof item.user === 'object' && !parsedItem.incidentBy) {
    parsedItem.incidentBy = item.user.id
  }

  currentItem.value = parsedItem
  managerSearch.value = ''
  incidentBySearch.value = ''
  bookingSearch.value = ''
  showModal.value = true
}
const formatDateTime = (value) => {
  if (!value || value.length < 5) return '';

  const [year, month, day, hour, minute] = value;

  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  const payload = { ...currentItem.value }
  
  
  
  if (modalMode.value === 'edit') {
    try {
      const res = await deviceIncidentService.updateDeviceIncident(currentItem.value.id, payload)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('DeviceIncident updated successfully!')
        closeModal()
        fetchItems()
      } else {
        alert(res.message || 'Failed to update')
      }
    } catch (err) {
      alert('Error updating: ' + (err.response?.data?.message || err.message))
    }
    return
  }
  
  try {
    const res = await deviceIncidentService.createDeviceIncident(payload)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('DeviceIncident created successfully!')
      closeModal()
      fetchItems()
    } else {
      alert(res.message || 'Failed to create')
    }
  } catch (err) {
    alert('Error creating: ' + (err.response?.data?.message || err.message))
  }
}

const handleDelete = async (id) => {
  
  if (!confirm('Are you sure you want to delete this item?')) return
  try {
    const res = await deviceIncidentService.deleteDeviceIncident(id)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('Deleted successfully!')
      fetchItems()
    } else {
      alert(res.message || 'Failed to delete')
    }
  } catch (err) {
    alert('Error deleting: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Manage DeviceIncident</h1>
      <button @click="openAddModal" class="btn btn-primary">Add DeviceIncident</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>id</th>
              <th>description</th>
              <th>timeIncident</th>
              <th>status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="deviceIncidents.length === 0">
              <td colspan="5" class="empty-state">No items available.</td>
            </tr>
            <tr v-for="item in deviceIncidents" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.description }}</td>
              <td>{{ formatDateTime(item.timeIncident) }}</td>
              <td>{{ item.status }}</td>
              <td class="actions-cell">
                <button @click="openEditModal(item)" class="btn btn-outline btn-sm mr-2" title="Edit">
                  <Pencil :size="16" />
                </button>
                <button  @click="handleDelete(item.id)" class="btn btn-danger btn-sm" title="Delete">
                  <Trash :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <div class="modal-header">
          <h2>{{ modalMode === 'add' ? 'Add New DeviceIncident' : 'Edit DeviceIncident' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="description">Description</label>
            <input 
              id="description"
              v-model="currentItem.description" 
              type="text" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="timeIncident">Time Incident</label>
            <input 
              id="timeIncident"
              v-model="currentItem.timeIncident" 
              type="datetime-local" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="status">Status</label>
            <select 
              id="status"
              v-model="currentItem.status" 
              class="form-control"
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELED">CANCELED</option>
              <option value="BOOKED">BOOKED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="INPROCESS">INPROCESS</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Manager ID</label>
            <div class="custom-select-container">
              <input type="text" v-model="managerSearch" class="form-control mb-1" placeholder="Search manager..." />
              <div class="select-list">
                <label v-for="user in filteredManagers" :key="user.id" class="select-item">
                  <input type="radio" :value="user.id" v-model="currentItem.managerId" />
                  {{ user.id }} - {{ user.username || user.name || user.email }}
                </label>
                <div v-if="filteredManagers.length === 0" class="text-muted text-sm mt-1">No users found.</div>
              </div>
            </div>
            <div v-if="currentItem.managerId" class="selected-text mt-1">
              Selected: {{ getUserDisplay(currentItem.managerId) }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Booking ID</label>
            <div class="custom-select-container">
              <input type="text" v-model="bookingSearch" class="form-control mb-1" placeholder="Search booking..." />
              <div class="select-list">
                <label v-for="booking in filteredBookings" :key="booking.id" class="select-item">
                  <input type="radio" :value="booking.id" v-model="currentItem.bookingId" />
                  {{ booking.id }} - Room {{ booking.roomId }} - {{ booking.startTime }} - {{ booking.endTime }}
                </label>
                <div v-if="filteredBookings.length === 0" class="text-muted text-sm mt-1">No bookings found.</div>
              </div>
            </div>
            <div v-if="currentItem.bookingId" class="selected-text mt-1">
              Selected: {{ getBookingDisplay(currentItem.bookingId) }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Incident By (User ID)</label>
            <div class="custom-select-container">
              <input type="text" v-model="incidentBySearch" class="form-control mb-1" placeholder="Search user..." />
              <div class="select-list">
                <label v-for="user in filteredIncidentBy" :key="user.id" class="select-item">
                  <input type="radio" :value="user.id" v-model="currentItem.incidentBy" />
                  {{ user.id }} - {{ user.username || user.name || user.email }}
                </label>
                <div v-if="filteredIncidentBy.length === 0" class="text-muted text-sm mt-1">No users found.</div>
              </div>
            </div>
            <div v-if="currentItem.incidentBy" class="selected-text mt-1">
              Selected: {{ getUserDisplay(currentItem.incidentBy) }}
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-outline mr-2" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ modalMode === 'add' ? 'Create' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 1.75rem; margin: 0; }
.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border); }
.table th { font-weight: 600; color: var(--text-main); background-color: #f3f4f6; }
.actions-cell { display: flex; gap: 0.5rem; }
.mr-2 { margin-right: 0.5rem; }
.empty-state { text-align: center; padding: 2rem; color: var(--text-muted); }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { width: 100%; max-width: 500px; padding: 2rem; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.modal-header h2 { margin: 0; font-size: 1.25rem; }
.close-btn { background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.close-btn:hover { color: var(--text-main); }
.modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }
.custom-select-container { border: 1px solid var(--border); border-radius: 4px; padding: 0.5rem; background: #fff; }
.select-list { max-height: 120px; overflow-y: auto; margin-top: 0.5rem; border-top: 1px solid #e5e7eb; padding-top: 0.5rem; }
.select-item { display: block; margin-bottom: 0.25rem; cursor: pointer; font-size: 0.875rem; color: var(--text-main); }
.select-item input { margin-right: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mt-1 { margin-top: 0.25rem; }
.text-sm { font-size: 0.875rem; }
.text-muted { color: var(--text-muted); }
.selected-text { font-size: 0.875rem; color: #10b981; font-weight: 500; }
</style>
