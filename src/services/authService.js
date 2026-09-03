import api from './api'

export default {
  register(data) {
    return api.post('/authen/register', data)
  },
  
  verifyEmail(username, code) {
    return api.post('/authen/active', {
      username: username,
      otp: code
    })
  }
}
