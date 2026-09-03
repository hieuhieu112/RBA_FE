import api from './api'

export default {
  getAllDeviceTypes() {
    return api.get('/devicetypes')
  },
  
  getDeviceTypeById(id) {
    return api.get(`/devicetypes/${id}`)
  },
  
  createDeviceType(data) {
    return api.post('/devicetypes', data)
  },
  
  updateDeviceType(id, data) {
    return api.put(`/devicetypes/${id}`, data)
  },
  
  deleteDeviceType(id) {
    return api.delete(`/devicetypes/${id}`)
  }
}
