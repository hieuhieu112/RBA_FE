import api from './api'

export default {
  getAllBookings() {
    return api.get('/bookings')
  },
  
  getBookingById(id) {
    return api.get(`/bookings/${id}`)
  },
  
  createBooking(bookingData) {
    return api.post('/bookings', bookingData)
  },
  
  cancelBooking(id) {
    return api.delete(`/bookings/${id}`)
  },
  
  approveBooking(id) {
    return api.put(`/bookings/${id}/approval`)
  }
}
