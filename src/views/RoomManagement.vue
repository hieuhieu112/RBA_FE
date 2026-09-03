<script setup>
import { ref, onMounted } from 'vue'
import { Pencil, Trash, Image as ImageIcon, Plus, X } from 'lucide-vue-next'
import roomService from '@/services/roomService'
import roomTypeService from '@/services/roomTypeService'
import houseService from '@/services/houseService'
import api from '@/services/api'

const rooms = ref([])
const roomTypes = ref([])
const houses = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const imageFiles = ref([])
const addImagesInput = ref(null)
const viewingImage = ref(null)

const filterHouseId = ref('')
const filterRoomTypeId = ref('')
const filterSearch = ref('')  

const currentRoom = ref({
  name: '',
  location: '',
  capacity: 1,
  roomTypeId: '',
  houseId: ''
})

onMounted(async () => {
  await Promise.all([
    fetchRooms(),
    fetchRoomTypes(),
    fetchHouses()
  ])
})

const fetchRooms = async () => {
  loading.value = true
  try {
    let res;
    if (filterHouseId.value || filterRoomTypeId.value || filterSearch.value) {
      res = await roomService.filterRooms(filterHouseId.value, filterRoomTypeId.value, filterSearch.value)
    } else {
      res = await roomService.getAllRooms()
    }
    
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
}

const fetchRoomTypes = async () => {
  try {
    const res = await roomTypeService.getAllRoomTypes()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      roomTypes.value = res.data || []
    }
  } catch (err) {
    console.error('Failed to load room types', err)
  }
}

const fetchHouses = async () => {
  try {
    const res = await houseService.getAllHouses()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      houses.value = res.data || []
    }
  } catch (err) {
    console.error('Failed to load houses', err)
  }
}

const openAddModal = () => {
  modalMode.value = 'add'
  currentRoom.value = { name: '', location: '', capacity: 1, roomTypeId: '', houseId: '' }
  imageFiles.value = []
  showModal.value = true
}

const openEditModal = (room) => {
  modalMode.value = 'edit'
  currentRoom.value = { ...room }
  imageFiles.value = []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  let hasInvalidFile = false
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      imageFiles.value.push(file)
    } else {
      hasInvalidFile = true
    }
  })
  
  if (hasInvalidFile) {
    alert('Some files were not added because they are not images.')
  }
  
  // Reset input so the same files can be selected again if removed
  e.target.value = ''
}

const removeImage = (index) => {
  imageFiles.value.splice(index, 1)
}

const deleteExistingImage = async (imageId) => {
  if (!confirm('Are you sure you want to delete this image?')) return
  try {
    const res = await roomService.deleteRoomImage(imageId)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
       if(currentRoom.value.image) {
         currentRoom.value.image = currentRoom.value.image.filter(img => img.id !== imageId)
       }
       fetchRooms()
    } else {
       alert(res.message || 'Failed to delete image')
    }
  } catch (err) {
    alert('Error deleting image: ' + (err.response?.data?.message || err.message))
  }
}

const handleUploadAdditionalImages = async (e) => {
  const files = Array.from(e.target.files)
  if (files.length === 0) return
  
  const formData = new FormData()
  formData.append('name', currentRoom.value.name)
  formData.append('location', currentRoom.value.location)
  formData.append('capacity', currentRoom.value.capacity)
  formData.append('roomTypeId', currentRoom.value.roomTypeId)
  formData.append('houseId', currentRoom.value.houseId)
  formData.append('cleaningDurationMinutes', 15)
  
  files.forEach(f => formData.append('images', f))
  
  try {
    const res = await roomService.updateRoom(currentRoom.value.id, formData)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      if(res.data && res.data.image) {
         currentRoom.value.image = res.data.image
      }
      fetchRooms()
    } else {
      alert(res.message || 'Failed to add images')
    }
  } catch (err) {
    alert('Error adding images: ' + (err.response?.data?.message || err.message))
  }
  
  e.target.value = ''
}

const handleSubmit = async () => {
  if (modalMode.value === 'edit') {
    try {
      const formData = new FormData()
      formData.append('name', currentRoom.value.name)
      formData.append('location', currentRoom.value.location)
      formData.append('capacity', currentRoom.value.capacity)
      formData.append('roomTypeId', currentRoom.value.roomTypeId)
      formData.append('houseId', currentRoom.value.houseId)
      formData.append('cleaningDurationMinutes', 15)

      const res = await roomService.updateRoom(currentRoom.value.id, formData)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('Room updated successfully!')
        closeModal()
        fetchRooms()
      } else {
        alert(res.message || 'Failed to update room')
      }
    } catch (err) {
      alert('Error updating room: ' + (err.response?.data?.message || err.message))
    }
    return
  }
  
  if (imageFiles.value.length === 0) {
    alert('Please select at least one image for the room.')
    return
  }

  try {
    const formData = new FormData()
    formData.append('name', currentRoom.value.name)
    formData.append('location', currentRoom.value.location)
    formData.append('capacity', currentRoom.value.capacity)
    formData.append('roomTypeId', currentRoom.value.roomTypeId)
    formData.append('houseId', currentRoom.value.houseId)
    imageFiles.value.forEach((file) => {
      formData.append('images', file)
    })

    const res = await roomService.createRoom(formData)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('Room created successfully!')
      closeModal()
      fetchRooms()
    } else {
      alert(res.message || 'Failed to create room')
    }
  } catch (err) {
    alert('Error creating room: ' + (err.response?.data?.message || err.message))
  }
}

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this room?')) return
  try {
    const res = await roomService.deleteRoom(id)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('Room deleted successfully!')
      fetchRooms()
    } else {
      alert(res.message || 'Failed to delete room')
    }
  } catch (err) {
    alert('Error deleting room: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Room Management</h1>
      <button @click="openAddModal" class="btn btn-primary">Add Room</button>
    </div>

    <div class="filters-container card mb-4">
      <div class="filter-group">
        <label for="filterSearch" class="form-label">Search:</label>
        <input type="text" id="filterSearch" v-model="filterSearch" class="form-control" @change="fetchRooms">
      </div>

      <div class="filter-group">
        <label for="filterHouse" class="form-label">House:</label>
        <select id="filterHouse" v-model="filterHouseId" class="form-control" @change="fetchRooms">
          <option value="">All Houses</option>
          <option v-for="house in houses" :key="house.id" :value="house.id">
            {{ house.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filterRoomType" class="form-label">Room Type:</label>
        <select id="filterRoomType" v-model="filterRoomTypeId" class="form-control" @change="fetchRooms">
          <option value="">All Room Types</option>
          <option v-for="type in roomTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading rooms...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rooms.length === 0">
              <td colspan="5" class="empty-state">No rooms available.</td>
            </tr>
            <tr v-for="room in rooms" :key="room.id">
              <td>{{ room.id }}</td>
              <td>
                <div class="list-thumbnail-container">
                  <img v-if="room.image && room.image.length > 0" :src="api.defaults.baseURL + room.image[0].url" class="list-thumbnail" />
                  <div v-else class="list-thumbnail-placeholder">
                    <ImageIcon :size="20" />
                  </div>
                </div>
              </td>
              <td>{{ room.name }}</td>
              <td>{{ room.location }}</td>
              <td>{{ room.capacity }}</td>
              <td class="actions-cell">
                <button @click="openEditModal(room)" class="btn btn-outline btn-sm mr-2" title="Edit Room">
                  <Pencil :size="16" />
                </button>
                <button @click="handleDelete(room.id)" class="btn btn-danger btn-sm" title="Delete Room">
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
          <h2>{{ modalMode === 'add' ? 'Add New Room' : 'Edit Room' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <div v-if="modalMode === 'edit'" class="alert alert-error mb-4" style="display: none;">
          Save operation for Edit is currently disabled.
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="name">Room Name</label>
            <input 
              id="name"
              v-model="currentRoom.name" 
              type="text" 
              class="form-control" 
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="location">Location</label>
            <input 
              id="location"
              v-model="currentRoom.location" 
              type="text" 
              class="form-control" 
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="capacity">Capacity</label>
            <input 
              id="capacity"
              v-model="currentRoom.capacity" 
              type="number" 
              class="form-control" 
              min="1"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="roomTypeId">Room Type</label>
            <select 
              id="roomTypeId" 
              v-model="currentRoom.roomTypeId" 
              class="form-control" 
              required
            >
              <option value="" disabled>Select Room Type</option>
              <option v-for="type in roomTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="houseId">House</label>
            <select 
              id="houseId" 
              v-model="currentRoom.houseId" 
              class="form-control" 
              required
            >
              <option value="" disabled>Select House</option>
              <option v-for="house in houses" :key="house.id" :value="house.id">
                {{ house.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="images">Room Images</label>
            
            <div v-if="modalMode === 'add'">
              <input 
                id="images"
                type="file" 
                class="form-control" 
                accept="image/*"
                multiple
                @change="handleFileChange"
              />
              <div v-if="imageFiles.length > 0" class="selected-images mt-2">
                <p class="text-sm fw-bold">Selected images:</p>
                <ul class="image-list">
                  <li v-for="(file, idx) in imageFiles" :key="idx" class="image-list-item">
                    <span class="file-name">{{ file.name }}</span>
                    <button type="button" @click="removeImage(idx)" class="btn-remove" title="Remove image">
                      &times;
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div v-else class="image-management-ui">
              <div class="image-grid">
                <div v-for="img in currentRoom.image" :key="img.id" class="image-box">
                  <img :src="api.defaults.baseURL + img.url" alt="Room Image" class="img-preview" @click="viewingImage = api.defaults.baseURL + img.url" />
                  <button type="button" class="btn-delete-img" @click.stop="deleteExistingImage(img.id)">
                    <Trash :size="14" />
                  </button>
                </div>
                <div class="image-box add-box" @click="addImagesInput.click()">
                  <Plus :size="24" />
                  <span class="add-text">Add</span>
                </div>
                <input type="file" ref="addImagesInput" accept="image/*" multiple style="display: none" @change="handleUploadAdditionalImages" />
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-outline mr-2" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ modalMode === 'add' ? 'Create Room' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- Image Viewer Modal -->
    <div v-if="viewingImage" class="modal-overlay image-viewer-overlay" @click.self="viewingImage = null">
      <div class="image-viewer-content">
        <button class="close-viewer-btn" @click="viewingImage = null"><X :size="36" /></button>
        <img :src="viewingImage" alt="Full Image" class="full-image" />
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

.mt-2 {
  margin-top: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.fw-bold {
  font-weight: 600;
}

.selected-images {
  background: var(--surface);
  padding: 0.75rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.image-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.image-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border);
}

.image-list-item:last-child {
  border-bottom: none;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 85%;
}

.btn-remove {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
}

.btn-remove:hover {
  color: #dc2626;
}

/* Image Management & List */
.list-thumbnail-container {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.list-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.list-thumbnail-placeholder {
  color: var(--text-muted);
}
.image-management-ui {
  margin-top: 0.5rem;
}
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.image-box {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
}
.img-preview {
  width: 100%;
  height: 100%;
  padding: 15px;
  object-fit: cover;
}
.btn-delete-img {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.btn-delete-img:hover {
  background: #b91c1c;
}
.add-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border: 1px dashed var(--border);
  color: var(--text-muted);
}
.add-box:hover {
  background-color: #f3f4f6;
  color: var(--text-main);
}
.add-text {
  font-size: 0.75rem;
  margin-top: 4px;
}
.image-viewer-overlay {
  z-index: 2000;
  background: rgba(0,0,0,0.8);
}
.image-viewer-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}
.full-image {
  min-width: 600px;
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}
.close-viewer-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
