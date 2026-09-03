import api from './api'

export default {
  getAllDeviceModels() {
    return api.get('/devicemodels')
  },
  
  getDeviceModelById(id) {
    return api.get(`/devicemodels/${id}`)
  },
  
  createDeviceModel(data) {
    return api.post('/devicemodels', data)
  },
  
  updateDeviceModel(id, data) {
    return api.put(`/devicemodels/${id}`, data)
  },
  
  deleteDeviceModel(id) {
    return api.delete(`/devicemodels/${id}`)
  }
}
