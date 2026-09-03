<script setup>
import { ref, onMounted } from 'vue'
import { Pencil, Trash } from 'lucide-vue-next'
import userService from '@/services/userService'

const users = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const modalMode = ref('add')

const currentItem = ref({
  "username": "",
  "name": "",
  "email": "",
  "pass": "",
  "status": "",
  "managerGroupId": null,
  "roles": ""
})

onMounted(async () => {
  await fetchItems()
})

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await userService.getAllUsers()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      users.value = res.data || []
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
  currentItem.value = {"username":"","name":"","email":"","pass":"","status":"","managerGroupId":null,"roles":""}
  showModal.value = true
}

const openEditModal = (item) => {
  modalMode.value = 'edit'
  let parsedItem = { ...item }
  if(parsedItem.roles && Array.isArray(parsedItem.roles)) parsedItem.roles = parsedItem.roles.join(',')
  currentItem.value = parsedItem
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  const payload = { ...currentItem.value }
  if(payload.roles) payload.roles = payload.roles.split(',').map(s=>s.trim()).filter(s=>s)
  
  
  if (modalMode.value === 'edit') {
    try {
      const res = await userService.updateUser(currentItem.value.id, payload)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('User updated successfully!')
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
    const res = await userService.createUser(payload)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('User created successfully!')
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
    const res = await userService.deleteUser(id)
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
      <h1 class="page-title">Manage User</h1>
      <button @click="openAddModal" class="btn btn-primary">Add User</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>id</th>
              <th>username</th>
              <th>name</th>
              <th>email</th>
              <th>status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="6" class="empty-state">No items available.</td>
            </tr>
            <tr v-for="item in users" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.username }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.email }}</td>
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
          <h2>{{ modalMode === 'add' ? 'Add New User' : 'Edit User' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input 
              id="username"
              v-model="currentItem.username" 
              type="text" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="name">Name</label>
            <input 
              id="name"
              v-model="currentItem.name" 
              type="text" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input 
              id="email"
              v-model="currentItem.email" 
              type="text" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="pass">Password</label>
            <input 
              id="pass"
              v-model="currentItem.pass" 
              type="password" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="status">Status</label>
            <input 
              id="status"
              v-model="currentItem.status" 
              type="text" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="managerGroupId">Manager Group ID</label>
            <input 
              id="managerGroupId"
              v-model="currentItem.managerGroupId" 
              type="number" 
              class="form-control" 
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="roles">Roles (comma separated)</label>
            <input 
              id="roles"
              v-model="currentItem.roles" 
              type="text" 
              class="form-control" 
            />
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
</style>
