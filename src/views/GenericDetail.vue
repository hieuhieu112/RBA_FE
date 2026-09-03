<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const resourceType = route.params.type
const resourceId = route.params.id
const detailData = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  if (history.state && history.state.detailData) {
    try {
      detailData.value = JSON.parse(history.state.detailData)
      loading.value = false
      return
    } catch (e) {
      console.error('Failed to parse history state data', e)
    }
  }

  // Fallback: fetch directly
  try {
    const res = await api.get(`/${resourceType}/${resourceId}`)
    detailData.value = res.data || res
  } catch (err) {
    error.value = `Failed to load ${resourceType} details`
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="generic-detail-page">
    <div class="page-header">
      <h1 class="page-title">{{ resourceType.replace(/^./, str => str.toUpperCase()) }} Detail #{{ resourceId }}</h1>
      <button @click="$router.back()" class="btn btn-outline">Back</button>
    </div>

    <div v-if="loading" class="loading">Loading details...</div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <div v-else-if="detailData" class="card detail-card">
      <div class="detail-grid">
        <div v-for="(value, key) in detailData" :key="key" class="detail-item">
          <span class="detail-label">{{ key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) }}</span>
          <span class="detail-value">
            <template v-if="typeof value === 'object' && value !== null">
              <pre class="json-value">{{ JSON.stringify(value, null, 2) }}</pre>
            </template>
            <template v-else>
              {{ value }}
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generic-detail-page {
  max-width: 800px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.page-title {
  font-size: 1.75rem;
  color: var(--text-main);
  text-transform: capitalize;
}
.detail-card {
  padding: 2rem;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}
.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}
.detail-value {
  font-size: 1rem;
  color: var(--text-main);
  word-break: break-word;
}
.json-value {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  overflow-x: auto;
  margin: 0;
}
.btn-outline {
  padding: 0.5rem 1rem;
}
</style>
