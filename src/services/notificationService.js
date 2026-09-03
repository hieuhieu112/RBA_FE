import api from './api'

const notificationService = {
  getNotifications() {
    return api.get('/notification')
  },

  markAsRead(notificationId) {
    return api.post(`/notification/${notificationId}/read`)
  },

  executeAction(url) {
    return api.get(url)
  }
}

export default notificationService
