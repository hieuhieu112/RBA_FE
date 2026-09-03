<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const isLoginPage = computed(() => route.name === 'Login')
</script>

<template>
  <div class="app-container">
    <Navbar v-if="!isLoginPage" />
    <main :class="{ 'main-content': !isLoginPage }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>
