import api from './api'

export default {
  getAllManufacturerDevices() {
    return api.get('/manufacturerdevices')
  },
  
  getManufacturerDeviceById(id) {
    return api.get(`/manufacturerdevices/${id}`)
  },
  
  createManufacturerDevice(data) {
    return api.post('/manufacturerdevices', data)
  },
  
  updateManufacturerDevice(id, data) {
    return api.put(`/manufacturerdevices/${id}`, data)
  },
  
  deleteManufacturerDevice(id) {
    return api.delete(`/manufacturerdevices/${id}`)
  }
}
