import api from './api'

export default {
  getAllDeviceIncidents() {
    return api.get('/deviceincidents')
  },
  
  getDeviceIncidentById(id) {
    return api.get(`/deviceincidents/${id}`)
  },
  
  createDeviceIncident(data) {
    return api.post('/deviceincidents', data)
  },
  
  updateDeviceIncident(id, data) {
    return api.put(`/deviceincidents/${id}`, data)
  },
  
  deleteDeviceIncident(id) {
    return api.delete(`/deviceincidents/${id}`)
  }
}
