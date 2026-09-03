<script setup>
import { ref, onMounted } from 'vue'
import { Pencil, Trash } from 'lucide-vue-next'
import houseService from '@/services/houseService'

const houses = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const modalMode = ref('add') // 'add' or 'edit'

const filterSearch = ref('')

const currentHouse = ref({
  name: ''
})

onMounted(async () => {
  await fetchHouses()
})

const fetchHouses = async () => {
  loading.value = true
  try {
    let res;
    if (filterSearch.value) {
      res = await houseService.filterHouses(filterSearch.value)
    } else {
      res = await houseService.getAllHouses()
    }
    
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      houses.value = res.data || []
    } else {
      error.value = res.message || 'Failed to load houses'
    }
  } catch (err) {
    error.value = 'An error occurred while loading houses.'
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  modalMode.value = 'add'
  currentHouse.value = { name: '' }
  showModal.value = true
}

const openEditModal = (house) => {
  modalMode.value = 'edit'
  currentHouse.value = { ...house }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (modalMode.value === 'edit') {
    try {
      const payload = {
        name: currentHouse.value.name
      }
      const res = await houseService.updateHouse(currentHouse.value.id, payload)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('House updated successfully!')
        closeModal()
        fetchHouses()
      } else {
        alert(res.message || 'Failed to update house')
      }
    } catch (err) {
      alert('Error updating house: ' + (err.response?.data?.message || err.message))
    }
    return
  }
  
  try {
    const payload = {
      name: currentHouse.value.name
    }
    const res = await houseService.createHouse(payload)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('House created successfully!')
      closeModal()
      fetchHouses()
    } else {
      alert(res.message || 'Failed to create house')
    }
  } catch (err) {
    alert('Error creating house: ' + (err.response?.data?.message || err.message))
  }
}

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this house?')) return
  try {
    const res = await houseService.deleteHouse(id)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('House deleted successfully!')
      fetchHouses()
    } else {
      alert(res.message || 'Failed to delete house')
    }
  } catch (err) {
    alert('Error deleting house: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">House Management</h1>
      <button @click="openAddModal" class="btn btn-primary">Add House</button>
    </div>

    <div class="filters-container card mb-4">
      <div class="filter-group">
        <label for="filterSearch" class="form-label">Search:</label>
        <input type="text" id="filterSearch" v-model="filterSearch" class="form-control" @change="fetchHouses" placeholder="Search by name">
      </div>
    </div>

    <div v-if="loading" class="loading">Loading houses...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="houses.length === 0">
              <td colspan="3" class="empty-state">No houses available.</td>
            </tr>
            <tr v-for="house in houses" :key="house.id">
              <td>{{ house.id }}</td>
              <td>{{ house.name }}</td>
              <td class="actions-cell">
                <button @click="openEditModal(house)" class="btn btn-outline btn-sm mr-2" title="Edit House">
                  <Pencil :size="16" />
                </button>
                <button @click="handleDelete(house.id)" class="btn btn-danger btn-sm" title="Delete House">
                  <Trash :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Add/Edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <div class="modal-header">
          <h2>{{ modalMode === 'add' ? 'Add New House' : 'Edit House' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="name">House Name</label>
            <input 
              id="name"
              v-model="currentHouse.name" 
              type="text" 
              class="form-control" 
              required
            />
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-outline mr-2" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ modalMode === 'add' ? 'Create House' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  margin: 0;
}

.filters-container {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 250px;
}

.filter-group .form-label {
  margin-bottom: 0;
  white-space: nowrap;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.table th {
  font-weight: 600;
  color: var(--text-main);
  background-color: #f3f4f6;
}
.table th:nth-child(2),
.table td:nth-child(2) {
  min-width: 300px;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}

.close-btn:hover {
  color: var(--text-main);
}

.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}
</style>
