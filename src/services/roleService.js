import api from './api'

export default {
  getAllRoles() {
    return api.get('/roles')
  },
  
  getRoleById(id) {
    return api.get(`/roles/${id}`)
  },
  
  createRole(data) {
    return api.post('/roles', data)
  },
  
  updateRole(id, data) {
    return api.put(`/roles/${id}`, data)
  },
  
  deleteRole(id) {
    return api.delete(`/roles/${id}`)
  }
}
