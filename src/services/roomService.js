import api from './api'

export default {
  getAllRooms() {
    return api.get('/rooms')
  },

  getRoomById(id) {
    return api.get(`/rooms/${id}`)
  },

  filterRooms(houseId, roomTypeId, search) {
    const params = {}
    if (houseId) params.houseId = houseId
    if (roomTypeId) params.roomTypeId = roomTypeId
    if (search) params.search = search
    return api.get('/rooms/filter', { params })
  },

  createRoom(formData) {
    return api.post('/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  updateRoom(id, formData) {
    return api.put(`/rooms/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  deleteRoom(id) {
    return api.delete(`/rooms/${id}`)
  },

  deleteRoomImage(imageId) {
    return api.delete(`/roomimages/${imageId}`)
  }
}
