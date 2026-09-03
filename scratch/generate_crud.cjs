const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');
const viewsDir = path.join(srcDir, 'views');
const servicesDir = path.join(srcDir, 'services');

const modules = [
  {
    name: 'User',
    route: 'users',
    endpoint: '/users',
    fields: [
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'pass', label: 'Password', type: 'password' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'managerGroupId', label: 'Manager Group ID', type: 'number' },
      { key: 'roles', label: 'Roles (comma separated)', type: 'text', isList: true }
    ],
    listFields: ['id', 'username', 'name', 'email', 'status']
  },
  {
    name: 'Role',
    route: 'roles',
    endpoint: '/roles',
    fields: [
      { key: 'name', label: 'Role Name', type: 'text' }
    ],
    listFields: ['id', 'name']
  },
  {
    name: 'ManagerGroup',
    route: 'manager-groups',
    endpoint: '/managergroups',
    fields: [
      { key: 'name', label: 'Group Name', type: 'text' },
      { key: 'listUser', label: 'User IDs (comma separated)', type: 'text', isIntList: true },
      { key: 'listRoom', label: 'Room IDs (comma separated)', type: 'text', isIntList: true }
    ],
    listFields: ['id', 'name']
  },
  {
    name: 'DeviceCategory',
    route: 'device-categories',
    endpoint: '/devicecategories',
    fields: [
      { key: 'name', label: 'Category Name', type: 'text' }
    ],
    listFields: ['id', 'name']
  },
  {
    name: 'DeviceIncident',
    route: 'device-incidents',
    endpoint: '/deviceincidents',
    fields: [
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'timeIncident', label: 'Time Incident', type: 'datetime-local' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'managerId', label: 'Manager ID', type: 'number' },
      { key: 'bookingId', label: 'Booking ID', type: 'number' },
      { key: 'incidentBy', label: 'Incident By (User ID)', type: 'number' }
    ],
    listFields: ['id', 'description', 'timeIncident', 'status']
  },
  {
    name: 'DeviceModel',
    route: 'device-models',
    endpoint: '/devicemodels',
    fields: [
      { key: 'name', label: 'Model Name', type: 'text' },
      { key: 'deviceTypeId', label: 'Device Type ID', type: 'number' },
      { key: 'manufacturerDeviceId', label: 'Manufacturer Device ID', type: 'number' },
      { key: 'specifications', label: 'Specifications', type: 'text' }
    ],
    listFields: ['id', 'name', 'deviceTypeId', 'manufacturerDeviceId']
  },
  {
    name: 'DeviceType',
    route: 'device-types',
    endpoint: '/devicetypes',
    fields: [
      { key: 'name', label: 'Type Name', type: 'text' }
    ],
    listFields: ['id', 'name']
  },
  {
    name: 'ManufacturerDevice',
    route: 'manufacturer-devices',
    endpoint: '/manufacturerdevices',
    fields: [
      { key: 'name', label: 'Manufacturer Name', type: 'text' }
    ],
    listFields: ['id', 'name']
  }
];

function generateService(mod) {
  const camelName = mod.name.charAt(0).toLowerCase() + mod.name.slice(1);
  return `import api from './api'

export default {
  getAll${mod.name}s() {
    return api.get('${mod.endpoint}')
  },
  
  get${mod.name}ById(id) {
    return api.get(\`${mod.endpoint}/\${id}\`)
  },
  
  create${mod.name}(data) {
    return api.post('${mod.endpoint}', data)
  },
  
  update${mod.name}(id, data) {
    return api.put(\`${mod.endpoint}/\${id}\`, data)
  },
  
  delete${mod.name}(id) {
    return api.delete(\`${mod.endpoint}/\${id}\`)
  }
}
`;
}

function generateVue(mod) {
  const camelName = mod.name.charAt(0).toLowerCase() + mod.name.slice(1);
  const itemsName = camelName + 's';
  const serviceName = camelName + 'Service';

  let defaultCurrent = {};
  mod.fields.forEach(f => {
    if (f.isList || f.isIntList) {
      defaultCurrent[f.key] = '';
    } else {
      defaultCurrent[f.key] = f.type === 'number' ? null : '';
    }
  });

  return `<script setup>
import { ref, onMounted } from 'vue'
import { Pencil, Trash } from 'lucide-vue-next'
import ${serviceName} from '@/services/${serviceName}'

const ${itemsName} = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const modalMode = ref('add')

const currentItem = ref(${JSON.stringify(defaultCurrent, null, 2)})

onMounted(async () => {
  await fetchItems()
})

const fetchItems = async () => {
  loading.value = true
  try {
    const res = await ${serviceName}.getAll${mod.name}s()
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      ${itemsName}.value = res.data || []
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
  currentItem.value = ${JSON.stringify(defaultCurrent)}
  showModal.value = true
}

const openEditModal = (item) => {
  modalMode.value = 'edit'
  let parsedItem = { ...item }
  ${mod.fields.filter(f => f.isList || f.isIntList).map(f => `if(parsedItem.${f.key} && Array.isArray(parsedItem.${f.key})) parsedItem.${f.key} = parsedItem.${f.key}.join(',')`).join('\n  ')}
  currentItem.value = parsedItem
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  const payload = { ...currentItem.value }
  ${mod.fields.filter(f => f.isList).map(f => `if(payload.${f.key}) payload.${f.key} = payload.${f.key}.split(',').map(s=>s.trim()).filter(s=>s)`).join('\n  ')}
  ${mod.fields.filter(f => f.isIntList).map(f => `if(payload.${f.key}) payload.${f.key} = payload.${f.key}.split(',').map(s=>parseInt(s.trim())).filter(s=>!isNaN(s))`).join('\n  ')}
  
  if (modalMode.value === 'edit') {
    try {
      const res = await ${serviceName}.update${mod.name}(currentItem.value.id, payload)
      if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
        alert('${mod.name} updated successfully!')
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
    const res = await ${serviceName}.create${mod.name}(payload)
    if (res.statusCode === '200' || res.statusCode === 'SUCCESS') {
      alert('${mod.name} created successfully!')
      closeModal()
      fetchItems()
    } else {
      alert(res.message || 'Failed to create')
    }
  } catch (err) {
    alert('Error creating: ' + (err.response?.data?.message || err.message))
  }
}

const handleDelete = async (id${mod.name === 'Role' ? ', name' : ''}) => {
  ${mod.name === 'Role' ? `if (name === 'SYSTEM_ADMIN') { alert('Cannot delete SYSTEM_ADMIN role.'); return; }` : ''}
  if (!confirm('Are you sure you want to delete this item?')) return
  try {
    const res = await ${serviceName}.delete${mod.name}(id)
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
      <h1 class="page-title">Manage ${mod.name}</h1>
      <button @click="openAddModal" class="btn btn-primary">Add ${mod.name}</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              ${mod.listFields.map(lf => `<th>${lf}</th>`).join('\n              ')}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="${itemsName}.length === 0">
              <td colspan="${mod.listFields.length + 1}" class="empty-state">No items available.</td>
            </tr>
            <tr v-for="item in ${itemsName}" :key="item.id">
              ${mod.listFields.map(lf => `<td>{{ item.${lf} }}</td>`).join('\n              ')}
              <td class="actions-cell">
                <button @click="openEditModal(item)" class="btn btn-outline btn-sm mr-2" title="Edit">
                  <Pencil :size="16" />
                </button>
                <button ${mod.name === 'Role' ? `v-if="item.name !== 'SYSTEM_ADMIN'"` : ''} @click="handleDelete(item.id${mod.name === 'Role' ? ', item.name' : ''})" class="btn btn-danger btn-sm" title="Delete">
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
          <h2>{{ modalMode === 'add' ? 'Add New ${mod.name}' : 'Edit ${mod.name}' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          ${mod.fields.map(f => `<div class="form-group">
            <label class="form-label" for="${f.key}">${f.label}</label>
            <input 
              id="${f.key}"
              v-model="currentItem.${f.key}" 
              type="${f.type}" 
              class="form-control" 
            />
          </div>`).join('\n          ')}
          
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
`;
}

modules.forEach(mod => {
  const camelName = mod.name.charAt(0).toLowerCase() + mod.name.slice(1);
  const servicePath = path.join(servicesDir, camelName + 'Service.js');
  const viewPath = path.join(viewsDir, mod.name + 'Management.vue');
  
  fs.writeFileSync(servicePath, generateService(mod));
  fs.writeFileSync(viewPath, generateVue(mod));
  console.log('Generated', mod.name);
});
