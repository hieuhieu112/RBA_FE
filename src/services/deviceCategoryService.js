import api from './api'

export default {
  getAllDeviceCategorys() {
    return api.get('/devicecategories')
  },
  
  getDeviceCategoryById(id) {
    return api.get(`/devicecategories/${id}`)
  },
  
  createDeviceCategory(data) {
    return api.post('/devicecategories', data)
  },
  
  updateDeviceCategory(id, data) {
    return api.put(`/devicecategories/${id}`, data)
  },
  
  deleteDeviceCategory(id) {
    return api.delete(`/devicecategories/${id}`)
  }
}
