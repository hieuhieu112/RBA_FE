import api from './api'

export default {
  getAllRoomTypes() {
    return api.get('/roomtypes')
  },
  
  getRoomTypeById(id) {
    return api.get(`/roomtypes/${id}`)
  },
  
  filterRoomTypes(search) {
    const params = {}
    if (search) params.search = search
    return api.get('/roomtypes/filter', { params })
  },
  
  createRoomType(data) {
    return api.post('/roomtypes', data)
  },
  
  updateRoomType(id, data) {
    return api.put(`/roomtypes/${id}`, data)
  },
  
  deleteRoomType(id) {
    return api.delete(`/roomtypes/${id}`)
  }
}
