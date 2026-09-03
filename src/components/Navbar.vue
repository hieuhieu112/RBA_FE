<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshCw } from 'lucide-vue-next'
import notificationService from '@/services/notificationService'
import { dispatchView } from '@/services/viewDispatcher'

const authStore = useAuthStore()
const router = useRouter()
const user = computed(() => authStore.user)

const notifications = ref([])
const showNotifications = ref(false)
const isRefreshingNotifs = ref(false)

const handleRefreshNotifications = async () => {
  if (isRefreshingNotifs.value) return
  isRefreshingNotifs.value = true
  await fetchNotifications()
  isRefreshingNotifs.value = false
}

const fetchNotifications = async () => {
  try {
    const res = await notificationService.getNotifications()
    if (res.statusCode === 'SUCCESS' || res.statusCode === '200') {
      notifications.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const closeNotifications = (e) => {
  if (!e.target.closest('.notification-container')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  if (user.value) {
    fetchNotifications()
  }
  document.addEventListener('click', closeNotifications)
})

onUnmounted(() => {
  document.removeEventListener('click', closeNotifications)
})

const handleNotificationClick = async (notification) => {
  showNotifications.value = false
  
  try {
    const res = await notificationService.markAsRead(notification.id)
    notification.isRead = true // Update local state immediately
    
    if (res && res.path) {
      await dispatchView(res.path)
    }
  } catch (e) {
    console.error('Failed to handle notification click:', e)
  }
}

const logout = () => {
  authStore.logout()
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="brand">
        <strong>RoomBook</strong>
      </router-link>
      
      <nav class="nav-links">
        <router-link to="/" class="nav-item">Dashboard</router-link>
        
        <div class="nav-dropdown">
          <span class="nav-item">Room</span>
          <div class="dropdown-content">
            <router-link to="/admin/rooms" class="dropdown-item">Manage Room</router-link>
            <router-link to="/admin/houses" class="dropdown-item">Manage House</router-link>
            <router-link to="/admin/room-types" class="dropdown-item">Manage Room Type</router-link>
          </div>
        </div>

        <div class="nav-dropdown">
          <span class="nav-item">User</span>
          <div class="dropdown-content">
            <router-link to="/admin/users" class="dropdown-item">User</router-link>
            <router-link to="/admin/roles" class="dropdown-item">Role</router-link>
            <router-link to="/admin/manager-groups" class="dropdown-item">Manager Group</router-link>
          </div>
        </div>

        <div class="nav-dropdown">
          <span class="nav-item">Device</span>
          <div class="dropdown-content">
            <router-link to="/admin/device-categories" class="dropdown-item">Device Category</router-link>
            <router-link to="/admin/device-incidents" class="dropdown-item">Device Incident</router-link>
            <router-link to="/admin/device-models" class="dropdown-item">Device Model</router-link>
            <router-link to="/admin/device-types" class="dropdown-item">Device Type</router-link>
            <router-link to="/admin/manufacturer-devices" class="dropdown-item">Manufacturer Device</router-link>
          </div>
        </div>

        <div class="nav-dropdown">
          <span class="nav-item">Booking</span>
          <div class="dropdown-content">
            <router-link to="/rooms" class="dropdown-item">All Bookings</router-link>
          </div>
        </div>
      </nav>
      
      <div class="user-menu">
        <span class="user-name" v-if="user">Hi, {{ user.fullName || user.username }}</span>
        
        <div class="notification-container" v-if="user">
          <button @click="toggleNotifications" class="bell-btn" aria-label="Notifications">
            🔔
            <span v-if="notifications.length > 0" class="notification-badge">{{ notifications.length }}</span>
          </button>
          
          <div class="notification-dropdown" v-if="showNotifications">
            <div class="notification-header">
              <h4>Notifications</h4>
              <button 
                @click="handleRefreshNotifications" 
                class="refresh-btn" 
                :disabled="isRefreshingNotifs"
                aria-label="Refresh notifications"
              >
                <RefreshCw :size="16" :class="{ 'spin': isRefreshingNotifs }" />
              </button>
            </div>
            <div class="notification-list" v-if="notifications.length > 0">
              <div 
                v-for="notif in notifications" 
                :key="notif.id" 
                class="notification-item"
                :class="{ 'unread': !notif.isRead }"
                @click="handleNotificationClick(notif)"
              >
                <div class="notif-title">{{ notif.title || notif.type }}</div>
                <div class="notif-content">{{ notif.content }}</div>
              </div>
            </div>
            <div class="notification-empty" v-else>
              No notifications
            </div>
          </div>
        </div>

        <button @click="logout" class="btn btn-outline btn-sm">Logout</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background-color: var(--surface);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-size: 1.25rem;
  color: var(--primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

/* .nav-item {
  color: var(--text-muted);
  font-weight: 500;
  padding: 0.5rem;
} */
.nav-item {
  color: var(--text-muted);
  font-weight: 500;
  padding: 0.5rem;
  display: inline-flex;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
}

.nav-item.router-link-active {
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
}

.nav-item:hover {
  color: var(--text-main);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.nav-dropdown {
  position: relative;
  display: inline-block;
}

.nav-dropdown:hover .dropdown-content {
  display: flex;
  flex-direction: column;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--surface);
  min-width: 200px;
  box-shadow: var(--shadow-md);
  border-radius: var(--radius);
  z-index: 20;
  padding: 0.5rem 0;
  border: 1px solid var(--border);
}

.dropdown-item {
  color: var(--text-main);
  padding: 0.75rem 1rem;
  text-decoration: none;
  display: block;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: var(--primary);
}

.dropdown-item.router-link-active {
  background-color: #f3f4f6;
  color: var(--primary);
  font-weight: 600;
}

/* Notifications */
.notification-container {
  position: relative;
  display: flex;
  align-items: center;
}

.bell-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  position: relative;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  border-radius: 9999px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 320px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  z-index: 50;
  overflow: hidden;
}

.notification-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  background-color: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
  color: var(--primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.notification-header h4 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-main);
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f3f4f6;
}

.notification-item.unread {
  background-color: #eff6ff;
}

.notification-item.unread:hover {
  background-color: #dbeafe;
}

.notif-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.notif-content {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.notification-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
