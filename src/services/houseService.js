import api from './api'

export default {
  getAllHouses() {
    return api.get('/houses')
  },
  
  getHouseById(id) {
    return api.get(`/houses/${id}`)
  },
  
  filterHouses(search) {
    const params = {}
    if (search) params.search = search
    return api.get('/houses/filter', { params })
  },
  
  createHouse(data) {
    return api.post('/houses', data)
  },
  
  updateHouse(id, data) {
    return api.put(`/houses/${id}`, data)
  },
  
  deleteHouse(id) {
    return api.delete(`/houses/${id}`)
  }
}
