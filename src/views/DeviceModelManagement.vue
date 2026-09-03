<script setup>
import { ref, onMounted, computed } from 'vue'
import { Pencil, Trash } from 'lucide-vue-next'
import deviceModelService from '@/services/deviceModelService'
import deviceTypeService from '@/services/deviceTypeService'
import manufacturerDeviceService from '@/services/manufacturerDeviceService'

const deviceModels = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const modalMode = ref('add')

const currentItem = ref({
  "name": "",
  "deviceTypeId": null,
  "manufacturerDeviceId": null,
  "specifications": ""
})

const deviceTypesList = ref([])
const manufacturersList = ref([])
const deviceTypeSearch = ref('')
const manufacturerSearch = ref('')

const filteredDeviceTypes = computed(() => {
  if (!deviceTypeSearch.value) return deviceTypesList.value
  const s = deviceTypeSearch.value.toLowerCase()
  return deviceTypesList.value.filter(dt => 
    String(dt.id).includes(s) ||
    (dt.name && dt.name.toLowerCase().includes(s))
  )
})

const filteredManufacturers = computed(() => {
  if (!manufacturerSearch.value) return manufacturersList.value
  const s = manufacturerSearch.value.toLowerCase()
  return manufacturersList.value.filter(m => 
    String(m.id).includes(s) ||
    (m.name && m.name.toLowerCase().includes(s))
  )
})

const getDeviceTypeDisplay = (id) => {
  const dt = deviceTypesList.value.find(d => d.id === id)
  return dt ? `${dt.id} - ${dt.name || 'N/A'}` : `ID: ${id}`
}

const getManufacturerDisplay = (id) => {
  const m = manufacturersList.value.find(ma => ma.id === id)
  return m ? `${m.id} - ${m.name || 'N/A'}` : `ID: ${id}`
}

onMounted(async () => {
  await Promise.all([
    fetchItems(),
    fetchDependencies()
  ])
})

const fetchDependencies = async () => {
  try {
    const [typesRes, manufacturersRes] = await Promise.all([
      deviceTypeService.getAllDeviceTypes(),
      manufacturerDeviceService.getAllManufacturerDevices()
    ])
    if (typesRes.statusCode === '200' || typesRes.statusCode === 'SUCCESS') {
      deviceTypesList.value = typesRes.data || []
    }
    if (manufacturersRes.statusCode === '200' || manufacturersRes.statusCode === 'SUCCESS') {
      manufacturersList.value = manufacturersRes.data || []
    }
  } catch (err) {
    console.error('Failed to load dependencies', err)
  }
}

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await deviceModelService.getAllDeviceModels()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      deviceModels.value = res.data || []
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
  currentItem.value = {"name":"","deviceTypeId":null,"manufacturerDeviceId":null,"specifications":""}
  deviceTypeSearch.value = ''
  manufacturerSearch.value = ''
  showModal.value = true
}

const openEditModal = (item) => {
  modalMode.value = 'edit'
  let parsedItem = { ...item }
  
  if (item.deviceType && typeof item.deviceType === 'object') {
    parsedItem.deviceTypeId = item.deviceType.id
  }
  
  if (item.manufacturerDevice && typeof item.manufacturerDevice === 'object') {
    parsedItem.manufacturerDeviceId = item.manufacturerDevice.id
  }
  
  currentItem.value = parsedItem
  deviceTypeSearch.value = ''
  manufacturerSearch.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  const payload = { ...currentItem.value }
  
  
  
  if (modalMode.value === 'edit') {
    try {
      const res = await deviceModelService.updateDeviceModel(currentItem.value.id, payload)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('DeviceModel updated successfully!')
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
    const res = await deviceModelService.createDeviceModel(payload)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('DeviceModel created successfully!')
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
    const res = await deviceModelService.deleteDeviceModel(id)
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
      <h1 class="page-title">Manage DeviceModel</h1>
      <button @click="openAddModal" class="btn btn-primary">Add DeviceModel</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>deviceTypeId</th>
              <th>manufacturerDeviceId</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="deviceModels.length === 0">
              <td colspan="5" class="empty-state">No items available.</td>
            </tr>
            <tr v-for="item in deviceModels" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.deviceTypeId }}</td>
              <td>{{ item.manufacturerDeviceId }}</td>
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
          <h2>{{ modalMode === 'add' ? 'Add New DeviceModel' : 'Edit DeviceModel' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="name">Model Name</label>
            <input 
              id="name"
              v-model="currentItem.name" 
              type="text" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label">Device Type ID</label>
            <div class="custom-select-container">
              <input type="text" v-model="deviceTypeSearch" class="form-control mb-1" placeholder="Search device type..." />
              <div class="select-list">
                <label v-for="dt in filteredDeviceTypes" :key="dt.id" class="select-item">
                  <input type="radio" :value="dt.id" v-model="currentItem.deviceTypeId" />
                  {{ dt.id }} - {{ dt.name }}
                </label>
                <div v-if="filteredDeviceTypes.length === 0" class="text-muted text-sm mt-1">No device types found.</div>
              </div>
            </div>
            <div v-if="currentItem.deviceTypeId" class="selected-text mt-1">
              Selected: {{ getDeviceTypeDisplay(currentItem.deviceTypeId) }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Manufacturer Device ID</label>
            <div class="custom-select-container">
              <input type="text" v-model="manufacturerSearch" class="form-control mb-1" placeholder="Search manufacturer..." />
              <div class="select-list">
                <label v-for="m in filteredManufacturers" :key="m.id" class="select-item">
                  <input type="radio" :value="m.id" v-model="currentItem.manufacturerDeviceId" />
                  {{ m.id }} - {{ m.name }}
                </label>
                <div v-if="filteredManufacturers.length === 0" class="text-muted text-sm mt-1">No manufacturers found.</div>
              </div>
            </div>
            <div v-if="currentItem.manufacturerDeviceId" class="selected-text mt-1">
              Selected: {{ getManufacturerDisplay(currentItem.manufacturerDeviceId) }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="specifications">Specifications</label>
            <textarea 
              id="specifications"
              v-model="currentItem.specifications" 
              class="form-control" 
              rows="4"
            ></textarea>
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
