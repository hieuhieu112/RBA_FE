<script setup>
import { ref, onMounted, computed } from 'vue'
import { Pencil, Trash } from 'lucide-vue-next'
import managerGroupService from '@/services/managerGroupService'
import userService from '@/services/userService'
import roomService from '@/services/roomService'

const managerGroups = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const modalMode = ref('add')

const currentItem = ref({
  "name": "",
  "listUser": [],
  "listRoom": []
})

const usersList = ref([])
const roomsList = ref([])
const userSearch = ref('')
const roomSearch = ref('')

const filteredUsers = computed(() => {
  if (!userSearch.value) return usersList.value
  const s = userSearch.value.toLowerCase()
  return usersList.value.filter(u => 
    (u.username && u.username.toLowerCase().includes(s)) || 
    (u.name && u.name.toLowerCase().includes(s)) ||
    (u.email && u.email.toLowerCase().includes(s))
  )
})

const filteredRooms = computed(() => {
  if (!roomSearch.value) return roomsList.value
  const s = roomSearch.value.toLowerCase()
  return roomsList.value.filter(r => 
    (r.name && r.name.toLowerCase().includes(s))
  )
})

const getUserDisplay = (id) => {
  const user = usersList.value.find(u => u.id === id)
  return user ? (user.username || user.name || user.email) : `ID: ${id}`
}

const getRoomDisplay = (id) => {
  const room = roomsList.value.find(r => r.id === id)
  return room ? room.name : `ID: ${id}`
}
onMounted(async () => {
  await Promise.all([
    fetchItems(),
    fetchDependencies()
  ])
})

const fetchDependencies = async () => {
  try {
    const [usersRes, roomsRes] = await Promise.all([
      userService.getAllUsers(),
      roomService.getAllRooms()
    ])
    if (usersRes.statusCode === '200' || usersRes.statusCode === 'SUCCESS') {
      usersList.value = usersRes.data || []
    }
    if (roomsRes.statusCode === '200' || roomsRes.statusCode === 'SUCCESS') {
      roomsList.value = roomsRes.data || []
    }
  } catch (err) {
    console.error('Failed to load dependencies', err)
  }
}

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await managerGroupService.getAllManagerGroups()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      managerGroups.value = res.data || []
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
  currentItem.value = {"name":"","listUser":[],"listRoom":[]}
  userSearch.value = ''
  roomSearch.value = ''
  showModal.value = true
}

const openEditModal = (item) => {
  modalMode.value = 'edit'
  let parsedItem = { ...item }
  
  if (item.users && Array.isArray(item.users)) {
    parsedItem.listUser = item.users.map(u => typeof u === 'object' && u !== null ? u.id : u)
  } else {
    parsedItem.listUser = parsedItem.listUser ? [...parsedItem.listUser] : []
  }

  if (item.rooms && Array.isArray(item.rooms)) {
    parsedItem.listRoom = item.rooms.map(r => typeof r === 'object' && r !== null ? r.id : r)
  } else {
    parsedItem.listRoom = parsedItem.listRoom ? [...parsedItem.listRoom] : []
  }

  currentItem.value = parsedItem
  userSearch.value = ''
  roomSearch.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  const payload = { ...currentItem.value }
  
  if (modalMode.value === 'edit') {
    try {
      const res = await managerGroupService.updateManagerGroup(currentItem.value.id, payload)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('ManagerGroup updated successfully!')
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
    const res = await managerGroupService.createManagerGroup(payload)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('ManagerGroup created successfully!')
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
    const res = await managerGroupService.deleteManagerGroup(id)
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
      <h1 class="page-title">Manage ManagerGroup</h1>
      <button @click="openAddModal" class="btn btn-primary">Add ManagerGroup</button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="managerGroups.length === 0">
              <td colspan="3" class="empty-state">No items available.</td>
            </tr>
            <tr v-for="item in managerGroups" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
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
          <h2>{{ modalMode === 'add' ? 'Add New ManagerGroup' : 'Edit ManagerGroup' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="name">Group Name</label>
            <input 
              id="name"
              v-model="currentItem.name" 
              type="text" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label">Users (Search and select)</label>
            <div class="dropdown-container">
              <input type="text" v-model="userSearch" class="form-control" placeholder="Search user..." />
              <div class="checkbox-list">
                <label v-for="user in filteredUsers" :key="user.id" class="checkbox-label">
                  <input type="checkbox" :value="user.id" v-model="currentItem.listUser" />
                  {{ user.username || user.name || user.email }} (ID: {{ user.id }})
                </label>
                <div v-if="filteredUsers.length === 0" class="text-muted text-sm mt-1">No users found.</div>
              </div>
            </div>
            <div class="selected-tags mt-2">
              <span v-for="id in currentItem.listUser" :key="id" class="tag">
                {{ getUserDisplay(id) }}
                <button type="button" @click="currentItem.listUser = currentItem.listUser.filter(i => i !== id)">&times;</button>
              </span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Rooms (Search and select)</label>
            <div class="dropdown-container">
              <input type="text" v-model="roomSearch" class="form-control" placeholder="Search room..." />
              <div class="checkbox-list">
                <label v-for="room in filteredRooms" :key="room.id" class="checkbox-label">
                  <input type="checkbox" :value="room.id" v-model="currentItem.listRoom" />
                  {{ room.name }} (ID: {{ room.id }})
                </label>
                <div v-if="filteredRooms.length === 0" class="text-muted text-sm mt-1">No rooms found.</div>
              </div>
            </div>
            <div class="selected-tags mt-2">
              <span v-for="id in currentItem.listRoom" :key="id" class="tag">
                {{ getRoomDisplay(id) }}
                <button type="button" @click="currentItem.listRoom = currentItem.listRoom.filter(i => i !== id)">&times;</button>
              </span>
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
.dropdown-container { border: 1px solid var(--border); border-radius: 4px; padding: 0.5rem; background: #fff; }
.checkbox-list { max-height: 150px; overflow-y: auto; margin-top: 0.5rem; border-top: 1px solid #e5e7eb; padding-top: 0.5rem; }
.checkbox-label { display: block; margin-bottom: 0.25rem; cursor: pointer; font-size: 0.875rem; color: var(--text-main); }
.checkbox-label input { margin-right: 0.5rem; }
.selected-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag { background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; display: flex; align-items: center; gap: 0.25rem; }
.tag button { background: none; border: none; cursor: pointer; font-size: 1rem; line-height: 1; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; }
.mt-2 { margin-top: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.text-sm { font-size: 0.875rem; }
.text-muted { color: var(--text-muted); }
</style>
