import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('@/views/VerifyEmail.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: () => import('@/views/RoomList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms/:id',
    name: 'RoomDetails',
    component: () => import('@/views/RoomDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-bookings',
    name: 'MyBookings',
    component: () => import('@/views/MyBookings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/booking-detail/:id',
    name: 'BookingDetail',
    component: () => import('@/views/BookingDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/detail/:type/:id',
    name: 'GenericDetail',
    component: () => import('@/views/GenericDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/rooms',
    name: 'RoomManagement',
    component: () => import('@/views/RoomManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/houses',
    name: 'HouseManagement',
    component: () => import('@/views/HouseManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/room-types',
    name: 'RoomTypeManagement',
    component: () => import('@/views/RoomTypeManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('@/views/UserManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/roles',
    name: 'RoleManagement',
    component: () => import('@/views/RoleManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/manager-groups',
    name: 'ManagerGroupManagement',
    component: () => import('@/views/ManagerGroupManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/device-categories',
    name: 'DeviceCategoryManagement',
    component: () => import('@/views/DeviceCategoryManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/device-incidents',
    name: 'DeviceIncidentManagement',
    component: () => import('@/views/DeviceIncidentManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/device-models',
    name: 'DeviceModelManagement',
    component: () => import('@/views/DeviceModelManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/device-types',
    name: 'DeviceTypeManagement',
    component: () => import('@/views/DeviceTypeManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/manufacturer-devices',
    name: 'ManufacturerDeviceManagement',
    component: () => import('@/views/ManufacturerDeviceManagement.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
