import api from './api'

export default {
  getAllManagerGroups() {
    return api.get('/managergroups')
  },
  
  getManagerGroupById(id) {
    return api.get(`/managergroups/${id}`)
  },
  
  createManagerGroup(data) {
    return api.post('/managergroups', data)
  },
  
  updateManagerGroup(id, data) {
    return api.put(`/managergroups/${id}`, data)
  },
  
  deleteManagerGroup(id) {
    return api.delete(`/managergroups/${id}`)
  }
}
